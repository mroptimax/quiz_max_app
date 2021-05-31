<template>
  <ion-page>
    <base-layout>

      <ion-card v-if="loading" class="hcenter">
        <ion-spinner name="crescent"/>
      </ion-card>
      <div v-if="!loading">

        <ion-card>
          <ion-card-header>
            <!-- Total Stats -->
            <ion-card-title class="hcenter">
              Total of <b>{{ stats.count }}</b> Questions answered
              <p>{{Math.round(progressNum(getTotal(true), getTotal(false)) * 100)  }}% correct</p>
              <ion-progress-bar :value="progressNum(getTotal(true), getTotal(false))" color="tertiary"
                                v-if="getSum(getTotal(true), getTotal(false)) > 0"></ion-progress-bar>
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
          <!-- Each Category -->
            <div v-for="(stats, cat) in stats" v-bind:key="cat">
              <div v-if=" cat !== 'count'">
                <h4><b>{{ cat }}</b></h4>
                <ul>
                  <!-- Category Total -->
                  <li>
                    <b>Total ({{ getCategoryTotal(stats,false) + getCategoryTotal(stats, true) }}):
                      {{ Math.round(progressNum(getCategoryTotal(stats, true), getCategoryTotal(stats,false)) * 100) }}%</b>
                    <ion-progress-bar :value="progressNum(getCategoryTotal(stats, true), getCategoryTotal(stats,false))"
                                      color="primary"
                                      v-if="getSum(getCategoryTotal(stats, true), getCategoryTotal(stats,false)) > 0"></ion-progress-bar>
                  </li>

                  <!-- Each Difficulty in Category -->
                  <li v-for="(data, diff) in stats" v-bind:key="diff">
                    {{ diff }} ({{ getSum(data.right, data.wrong) }}):
                    {{ Math.round(progressNum(data.right, data.wrong) * 100) }}%
                    <ion-progress-bar :value="progressNum(data.right, data.wrong)" :color="getColor(diff)"
                                      v-if="getSum(data.right, data.wrong) > 0"></ion-progress-bar>
                  </li>
                </ul>
              </div>
            </div>

          </ion-card-content>
        </ion-card>

      </div>
      <!-- Return Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button v-on:click="gotToStart">
          <ion-icon :icon="returnDownBack"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </base-layout>
  </ion-page>
</template>

<script>
import {
  IonSpinner,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonFab,
  IonFabButton,
  IonIcon
} from "@ionic/vue";
import {Plugins} from "@capacitor/core";
import {returnDownBack} from "ionicons/icons";
import router from "@/router";

const {Storage} = Plugins;

export default {
  name: "Stats",
  components: {
    IonSpinner,
    IonPage,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonFab,
    IonFabButton,
    IonIcon
  },
  data() {
    return {
      stats: null,
      loading: true,
      returnDownBack
    }
  },
  async updated() {
    this.stats = JSON.parse((await Storage.get({key: 'stats'})).value)
    this.loading = false
  },
  methods: {
    progressNum(right, wrong) {
      return right / (right + wrong)
    },
    getSum(right, wrong) {
      return right + wrong
    },
    gotToStart() {
      router.push('/home');
    },
    getColor(diff) {
      switch (diff) {
        case 'easy':
          return 'success';
        case 'medium':
          return 'warning';
        case 'hard':
          return 'danger';
        default:
          return 'success';
      }
    },
    getCategoryTotal(data, right) {
      let sum = 0;
      if (right){
      sum += data.easy.right;
      sum += data.medium.right;
      sum += data.hard.right;}
      else{
        sum += data.easy.wrong;
        sum += data.medium.wrong;
        sum += data.hard.wrong;
      }

      return sum;
    },
    getTotal(right) {
      let sum = 0;
      for (const [key, data] of Object.entries(this.stats)) {
        if (key !== 'count') {
          if (right) {
            sum += this.getCategoryTotal(data, true);
          } else {
            sum += this.getCategoryTotal(data, false);
          }
        }
      }
      return sum;
    }
  }
}
</script>

<style scoped>

</style>
