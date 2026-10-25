<template>
  <ion-page>
    <base-layout back>

      <!-- Question Loaded -->
      <div v-if="question && !loading">
        <!-- always one row: a long category name wraps inside its own badge, difficulty + streak stay on the right -->
        <div class="badges">
          <ion-badge color="tertiary" class="category">{{ decoder(question.category) }}</ion-badge>
          <div class="meta">
            <ion-badge v-bind:color="setBadgeColor(question.difficulty)">
              {{ capitalize(question.difficulty) }}
            </ion-badge>
            <!-- light, so it can't be mistaken for the yellow "Medium" badge -->
            <ion-badge color="light" class="streak" v-if="streak > 0">
              <ion-icon :icon="flame" color="warning"/> {{ streak }}
            </ion-badge>
          </div>
        </div>

        <ion-card color="primary" class="question-card">
          <ion-card-content>
            <h2 class="question">{{ decoder(question.question) }}</h2>
          </ion-card-content>
        </ion-card>

        <ion-card v-for="(ans) in answers" v-bind:key="ans"
                  class="answer"
                  v-bind:class="{dimmed: getAnswerState(ans) === 'dimmed'}"
                  v-bind:color="getCardColor(ans)"
                  v-bind:button="!finished"
                  v-on:click="checkSolution(ans)">
          <ion-card-content class="answer-content">
            <span>{{ decoder(ans) }}</span>
            <ion-icon v-if="getAnswerState(ans) === 'correct'" :icon="checkmarkCircle" class="answer-icon"/>
            <ion-icon v-else-if="getAnswerState(ans) === 'wrong'" :icon="closeCircle" class="answer-icon"/>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Error -->
      <ion-card v-else-if="error" color="danger" class="hcenter">
        <ion-card-content>
          <p>{{ error }}</p>
          <ion-button color="light" v-on:click="retry" style="margin-top: 10px">
            Try again
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Loading -->
      <ion-card v-else class="hcenter">
        <ion-spinner name="crescent"/>
      </ion-card>

      <!-- Result + Continue, only after answering -->
      <template v-if="finished" #footer>
        <div class="result" v-bind:class="right ? 'result-right' : 'result-wrong'">
          <span v-if="right">Correct! +{{ points }} {{ points === 1 ? 'point' : 'points' }}</span>
          <span v-else>Wrong answer</span>
          <span v-if="newBest" class="new-best">
            · <ion-icon :icon="flame" color="warning"/> New best streak: {{ streak }}!
          </span>
        </div>
        <ion-button expand="block" size="large" v-on:click="getNewQuestion">
          Continue
        </ion-button>
      </template>

    </base-layout>
  </ion-page>
</template>

<script>
import BaseLayout from "@/views/base/BaseLayout";
import {Preferences} from '@capacitor/preferences';
import {Haptics, NotificationType} from '@capacitor/haptics';
import {checkmarkCircle, closeCircle, flame} from "ionicons/icons";
import {addDataToStats, getStreak, updateStreak} from "@/services/stats";
import {getQuestions} from "@/services/questions";
import {decodeHtml} from "@/services/text";

const MAX_RETRIES = 3
const RETRY_DELAY = 5000

import {
  IonPage,
  IonCard,
  IonButton,
  IonSpinner,
  IonBadge,
  IonCardContent,
  IonIcon
} from "@ionic/vue";

export default {
  name: "QuizPage",
  components: {
    BaseLayout,
    IonPage,
    IonCard,
    IonButton,
    IonSpinner,
    IonBadge,
    IonCardContent,
    IonIcon
  },
  data() {
    return {
      question: null,
      finished: false,
      answers: [],
      selected: null,
      right: true,
      loading: false,
      points: 0,
      loadedQuestions: [],
      checking: false,
      error: null,
      retries: 0,
      retryTimer: null,
      active: false,
      streak: 0,
      newBest: false,
      flame,
      checkmarkCircle,
      closeCircle,
    }
  },
  async ionViewDidEnter() {
    this.active = true
    this.retries = 0
    this.loadedQuestions = []
    this.getNewQuestion()
    this.streak = (await getStreak()).streak
  },
  ionViewWillLeave() {
    this.active = false
    clearTimeout(this.retryTimer)
    this.retryTimer = null
  },
  methods: {
    mixAnswers() {
      this.answers.push(this.question.incorrect_answers[0])
      this.answers.push(this.question.incorrect_answers[1])
      this.answers.push(this.question.incorrect_answers[2])
      this.answers.push(this.question.correct_answer)
      let j, x, i;
      for (i = this.answers.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = this.answers[i];
        this.answers[i] = this.answers[j];
        this.answers[j] = x;
      }
    },
    setBadgeColor(dif) {
      if (dif === 'medium') {
        return 'warning'
      } else if (dif === 'hard') {
        return 'danger'
      } else {
        return 'success'
      }
    },
    async checkSolution(ans) {
      // only one answer per question, also while the previous click is still being saved
      if (this.finished || this.checking) {
        return
      }
      this.checking = true
      try {
        this.selected = ans
        this.right = ans === this.question.correct_answer;
        this.vibrate(this.right)
        let add = 0
        if (this.question.difficulty === 'medium') {
          add = 2
        } else if (this.question.difficulty === 'hard') {
          add = 3
        } else if (this.question.difficulty === 'easy') {
          add = 1
        }
        this.points = add
        if (this.right) {
          let points = parseInt((await Preferences.get({key: 'points'})).value) || 0
          points = points + add
          await Preferences.set({key: 'points', value: String(points)})
        }
        await addDataToStats(this.question.category, this.question.difficulty, this.right)
        const streak = await updateStreak(this.right)
        this.streak = streak.streak
        this.newBest = streak.newBest
        this.finished = true
      } finally {
        this.checking = false
      }
    },
    showQuestion(question) {
      this.question = question
      this.mixAnswers()
      this.finished = false
      this.loading = false
    },
    retry() {
      this.retries = 0
      this.getNewQuestion()
    },
    getNewQuestion() {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
      this.loading = true
      this.finished = false
      this.error = null
      this.answers = []
      if (this.loadedQuestions.length > 0) {
        this.showQuestion(this.loadedQuestions.pop())
        return
      }
      getQuestions().then((res) => {
        if (!this.active) {
          return
        }
        // 1 = not enough questions for the chosen category/difficulty, retrying won't help
        if (res.data.response_code === 1) {
          this.error = 'There are not enough questions for this category and difficulty. Please choose different settings.'
          this.loading = false
          return
        }
        if (res.data.response_code !== 0 || !res.data.results || res.data.results.length === 0) {
          throw new Error('Unexpected API response code ' + res.data.response_code)
        }
        this.retries = 0
        this.loadedQuestions = res.data.results
        this.showQuestion(this.loadedQuestions.pop())
      }).catch((err) => {
        console.log(err)
        if (!this.active) {
          return
        }
        if (this.retries >= MAX_RETRIES) {
          this.error = 'Questions could not be loaded. Please check your internet connection.'
          this.loading = false
          return
        }
        this.retries++
        this.retryTimer = setTimeout(() => {this.getNewQuestion()}, RETRY_DELAY);
      })
    },
    decoder(str) {
      return decodeHtml(str);
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    vibrate(right) {
      // fire and forget, devices/browsers without vibration just ignore it
      Haptics.notification({type: right ? NotificationType.Success : NotificationType.Error})
          .catch(() => {})
    },
    /**
     * open before answering, afterwards correct / wrong (the selected one) / dimmed (the rest)
     */
    getAnswerState(ans) {
      if (!this.finished) {
        return 'open'
      }
      if (ans === this.question.correct_answer) {
        return 'correct'
      }
      return this.selected === ans ? 'wrong' : 'dimmed'
    },
    getCardColor(ans) {
      switch (this.getAnswerState(ans)) {
        case 'correct':
          return 'success'
        case 'wrong':
          return 'danger'
        default:
          return undefined
      }
    }
  },
}
</script>

<style scoped>
.badges {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 6px;
  margin: 16px 16px 0;
}

.badges ion-badge {
  padding: 5px 10px;
  font-size: 13px;
  line-height: 1.3;
}

.category {
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: left;
  border-radius: 10px;
}

.meta {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  margin-left: auto;
}

.meta ion-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.streak {
  border: 1px solid var(--ion-color-warning);
}

.question-card {
  margin-top: 8px;
}

.question-card ion-card-content {
  padding-top: 20px;
  padding-bottom: 20px;
}

.question {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.35;
}

.answer {
  margin-top: 10px;
  margin-bottom: 10px;
  box-shadow: none;
  border: 2px solid var(--ion-color-light-shade);
}

.answer.ion-color {
  border-color: transparent;
}

.answer.dimmed {
  opacity: 0.5;
}

.answer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  font-size: 17px;
  font-weight: 500;
}

.answer:not(.ion-color) .answer-content {
  color: var(--ion-text-color, #000000);
}

.answer-icon {
  flex-shrink: 0;
  font-size: 26px;
}

.result {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 16px;
}

.result-right {
  color: var(--ion-color-success-shade);
}

.result-wrong {
  color: var(--ion-color-danger);
}

.new-best {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ion-text-color, #000000);
}
</style>
