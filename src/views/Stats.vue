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
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <b>{{getTotal(true)}} ({{ Math.round(progressNum(getTotal(true), getTotal(false)) * 100) }}%) correct</b>
            <ion-progress-bar :value="progressNum(getTotal(true), getTotal(false))" color="tertiary"
                              v-if="getSum(getTotal(true), getTotal(false)) > 0"></ion-progress-bar>
          </ion-card-content>
        </ion-card>
        <!-- Each Category -->
        <div v-for="(stats, cat) in stats" v-bind:key="cat">
          <div v-if=" cat !== 'count'">
            <ion-item-divider>
              <h4><b>{{ cat }}</b></h4>
            </ion-item-divider>

            <div style="padding: 10px">
              <!-- Category Total -->
              <div>
                <b>Total ({{ getCategoryTotal(stats, false) + getCategoryTotal(stats, true) }}):
                  {{Math.round(progressNum(getCategoryTotal(stats, true), getCategoryTotal(stats, false)) * 100)}}%</b>
                <ion-progress-bar :value="progressNum(getCategoryTotal(stats, true), getCategoryTotal(stats,false))"
                                  color="primary"
                                  v-if="getSum(getCategoryTotal(stats, true), getCategoryTotal(stats,false)) > 0"></ion-progress-bar>
              </div>

              <!-- Each Difficulty in Category -->
              <div v-for="(data, diff) in stats" v-bind:key="diff" >
                <div v-if="getSum(data.right, data.wrong) > 0" style="padding: 10px">
                  {{ diff }} ({{ getSum(data.right, data.wrong) }}):
                  {{ Math.round(progressNum(data.right, data.wrong) * 100) }}%
                  <ion-progress-bar :value="progressNum(data.right, data.wrong)" :color="getColor(diff)"></ion-progress-bar>
                </div>
              </div>
            </div>
          </div>
        </div>


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
import {Preferences} from '@capacitor/preferences';
import {returnDownBack} from "ionicons/icons";
import router from "@/router";


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
  async mounted() {
    this.loading = true
    this.stats = JSON.parse((await Preferences.get({key: 'stats'})).value)
    this.loading = false
  },
  async ionViewDidEnter() {
    this.loading = true
    this.stats = JSON.parse((await Preferences.get({key: 'stats'})).value)
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
      if (right) {
        sum += data.easy.right;
        sum += data.medium.right;
        sum += data.hard.right;
      } else {
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
