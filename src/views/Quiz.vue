<template>
  <ion-page>
    <base-layout>

      <!-- Question Loaded -->
      <div v-if="question && !loading">
        <ion-card color="primary">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-badge color="tertiary"><span v-html="question.category"></span></ion-badge>
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
            <ion-card-subtitle v-if="getCardColor(ans) === 'success' && rigth && finished">
              <b> Correct! +{{ points }} Points!</b>
            </ion-card-subtitle>
            <h2> {{ decoder(ans) }}</h2>
          </ion-card-content>
        </ion-card>
      </div>

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
      rigth: true,
      loading: false,
      points: 0,
      loadedQuestions: [],
    }
  },
  mounted() {
    this.loadedQuestions = []
    this.getNewQuestion()
  },
  ionViewDidEnter() {
    this.loadedQuestions = []
    this.getNewQuestion()
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
      this.selected = ans
      this.rigth = ans === this.question.correct_answer;
      let add = 0
      if (this.question.difficulty === 'medium') {
        add = 2
      } else if (this.question.difficulty === 'hard') {
        add = 3
      } else if (this.question.difficulty === 'easy') {
        add = 1
      }
      this.points = add
      if (this.rigth) {
        let points = parseInt((await Preferences.get({key: 'points'})).value)
        points = points + add
        await Preferences.set({key: 'points', value: String(points)})
      }
      await addDataToStats(this.question.category, this.question.difficulty, this.rigth)
      this.finished = true
    },
    getNewQuestion() {
      this.loading = true
      this.answers = []
      if (this.loadedQuestions.length > 0) {
        this.question = this.loadedQuestions.pop()
        this.mixAnswers()
        this.finished = false
        this.loading = false
        return
      }
      getQuestions().then((res) => {
        this.loadedQuestions = res.data.results
        this.question = this.loadedQuestions.pop()
        this.mixAnswers()
        this.finished = false
        this.loading = false
      }).catch(async (err) => {
        console.log(err)
        setTimeout(() => {this.getNewQuestion()},5000);
      })
    },
    decoder(str) {
      let textArea = document.createElement('textarea');
      textArea.innerHTML = str;
      return textArea.value;
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
