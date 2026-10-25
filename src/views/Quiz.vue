<template>
  <ion-page>
    <base-layout>

      <!-- Question Loaded -->
      <div v-if="question && !loading">
        <ion-card color="primary">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-badge color="tertiary">{{ decoder(question.category) }}</ion-badge>
              <ion-badge v-bind:color="setBadgeColor(question.difficulty)" style="margin-left: 5px">
                {{ question.difficulty }}
              </ion-badge>
            </ion-card-subtitle>

          </ion-card-header>
          <ion-card-content>
            <h2>{{ decoder(question.question) }}</h2>
          </ion-card-content>
        </ion-card>

        <ion-card v-for="(ans) in answers" v-bind:key="ans"
                  v-bind:color="getCardColor(ans)"
                  v-on:click="checkSolution(ans)">
          <ion-card-content>
            <ion-card-subtitle v-if="getCardColor(ans) === 'success' && right && finished">
              <b> Correct! +{{ points }} Points!</b>
            </ion-card-subtitle>
            <h2> {{ decoder(ans) }}</h2>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Error -->
      <ion-card v-else-if="error" color="danger" class="hcenter">
        <ion-card-content>
          <p>{{ error }}</p>
          <ion-button color="light" v-on:click="retry" style="margin-top: 10px">
            try again
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Loading -->
      <ion-card v-else class="hcenter">
        <ion-spinner name="crescent"/>
      </ion-card>

      <!-- Nav Buttons -->
      <div id="container">
        <ion-button size="large" v-on:click="toHome" color="light">
          return
        </ion-button>
        <ion-button size="large" v-if="finished" v-on:click="getNewQuestion" style="padding-left: 5px">
          continue
        </ion-button>
      </div>

    </base-layout>
  </ion-page>
</template>

<script>
import BaseLayout from "@/views/base/BaseLayout";
import router from "@/router";
import {Preferences} from '@capacitor/preferences';
import {addDataToStats} from "@/services/stats";
import {getQuestions} from "@/services/questions";
import {decodeHtml} from "@/services/text";

const MAX_RETRIES = 3
const RETRY_DELAY = 5000

import {
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonButton,
  IonSpinner,
  IonBadge,
  IonCardContent
} from "@ionic/vue";

export default {
  name: "QuizPage",
  components: {
    BaseLayout,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonButton,
    IonSpinner,
    IonBadge,
    IonCardContent
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
    }
  },
  ionViewDidEnter() {
    this.active = true
    this.retries = 0
    this.loadedQuestions = []
    this.getNewQuestion()
  },
  ionViewWillLeave() {
    this.active = false
    clearTimeout(this.retryTimer)
    this.retryTimer = null
  },
  methods: {
    toHome() {
      router.push('/home');
    },
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
    getCardColor(ans) {
      if (ans === this.question.correct_answer && this.finished) {
        return 'success'
      } else if (this.selected === ans && this.finished) {
        return 'danger'
      }
      return 'medium'
    }
  },
}
</script>

<style scoped>
#container {
  text-align: center;
  left: 0;
  right: 0;
  padding-top: 10px;
}
</style>
