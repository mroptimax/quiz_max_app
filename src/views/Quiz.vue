<template>
  <ion-page>
    <base-layout>

      <!-- Question Loaded -->
      <div v-if="question && !loading">
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              <ion-badge color="tertiary">{{ question.category }}</ion-badge>
              <ion-badge v-bind:color="setBadgeColor(question.difficulty)" style="margin-left: 5px">{{
                  question.difficulty
                }}
              </ion-badge>
            </ion-card-subtitle>
            <ion-card-title>{{ decoder(question.question) }}</ion-card-title>
          </ion-card-header>
        </ion-card>


        <ion-card v-for="(ans, i) in answers" v-bind:key="ans"
                  v-bind:color="getCardColor(ans)"
                  v-on:click="checkSolution(ans)">
          <ion-card-header>
            <ion-card-title>
              {{ decoder('(' + (i + 1) + ') ' + ans) }}
            </ion-card-title>
            <ion-card-subtitle v-if="getCardColor(ans) === 'success' && rigth && finished">
              <b> Correct! +{{ points }} Points!</b>
            </ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </div>

      <!-- Loading -->
      <ion-card v-else class="hcenter">
        <ion-spinner name="crescent"/>
      </ion-card>

      <!-- Nav Buttons -->
      <div id="container">
        <ion-button v-on:click="toHome" color="light">
          return
        </ion-button>
        <ion-button v-if="finished" v-on:click="getNewQuestion">
          continue
        </ion-button>
      </div>

    </base-layout>
  </ion-page>
</template>

<script>
import BaseLayout from "@/views/base/BaseLayout";
import router from "@/router";
import {Plugins} from "@capacitor/core";
import {addDataToStats} from "@/services/stats";

const {Storage} = Plugins;

import {
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonSpinner
} from "@ionic/vue";
import {getQuestion} from "@/services/questions";

export default {
  name: "Quiz",
  components: {
    BaseLayout,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonButton,
    IonSpinner
  },
  data() {
    return {
      question: null,
      finished: false,
      answers: [],
      selected: null,
      rigth: true,
      loading: false,
      points: 0
    }
  },
  mounted() {
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
        let points = parseInt((await Storage.get({key: 'points'})).value)
        points = points + add
        await Storage.set({key: 'points', value: String(points)})
      }
      await addDataToStats(this.question.category, this.question.difficulty, this.rigth)
      this.finished = true
    },
    getNewQuestion() {
      this.loading = true
      this.answers = []
      getQuestion().then((res) => {
        this.question = res.data.results[0]
        this.mixAnswers()
        this.finished = false
        this.loading = false
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
  }
}
</script>

<style scoped>
#container {
  text-align: center;
  left: 0;
  right: 0;
  padding-top: 40px;
}
</style>
