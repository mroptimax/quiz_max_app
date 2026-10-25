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
            <b>{{ getTotal(true) }} ({{ Math.round(progressNum(getTotal(true), getTotal(false)) * 100) }}%) correct</b>
            <ion-progress-bar :value="progressNum(getTotal(true), getTotal(false))" color="tertiary"
                              v-if="getSum(getTotal(true), getTotal(false)) > 0"></ion-progress-bar>
          </ion-card-content>
        </ion-card>

        <!-- Each Category -->
        <div v-for="(catStats, cat) in stats" v-bind:key="cat">
          <div v-if="cat !== 'count' && getSum(getCategoryTotal(catStats, true), getCategoryTotal(catStats, false)) > 0">
            <ion-item-divider>
              <h4><b>{{ decoder(cat) }}</b></h4>
            </ion-item-divider>

            <div style="padding: 10px">
              <!-- Category Total -->
              <div>
                <b>Total ({{ getCategoryTotal(catStats, false) + getCategoryTotal(catStats, true) }}):
                  {{ Math.round(progressNum(getCategoryTotal(catStats, true), getCategoryTotal(catStats, false)) * 100) }}%</b>
                <ion-progress-bar :value="progressNum(getCategoryTotal(catStats, true), getCategoryTotal(catStats,false))"
                                  color="primary"
                                  v-if="getSum(getCategoryTotal(catStats, true), getCategoryTotal(catStats,false)) > 0"></ion-progress-bar>
              </div>

              <!-- Each Difficulty in Category -->
              <div v-for="(data, diff) in catStats" v-bind:key="diff">
                <div v-if="getSum(data.right, data.wrong) > 0" style="padding: 10px">
                  {{ diff }} ({{ getSum(data.right, data.wrong) }}):
                  {{ Math.round(progressNum(data.right, data.wrong) * 100) }}%
                  <ion-progress-bar :value="progressNum(data.right, data.wrong)"
                                    :color="getColor(diff)"></ion-progress-bar>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ion-card>
        <ion-card-content>
          <ion-button expand="block" color="danger" v-on:click="confirmReset">
            Reset Stats
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Return Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button v-on:click="goToStart">
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
  IonIcon, IonItemDivider, IonProgressBar, IonCardTitle, IonButton,
  alertController
} from "@ionic/vue";
import {returnDownBack} from "ionicons/icons";
import router from "@/router";
import {getStats, resetStats} from "@/services/stats";
import {decodeHtml} from "@/services/text";


export default {
  name: "StatsPage",
  components: {
    IonSpinner,
    IonPage,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonFab,
    IonFabButton, IonProgressBar,
    IonIcon, IonItemDivider, IonCardTitle, IonButton
  },
  data() {
    return {
      stats: null,
      loading: true,
      returnDownBack
    }
  },
  // also runs on the first visit, so no extra loading in mounted() needed
  async ionViewWillEnter() {
    this.loading = true
    this.stats = await getStats()
    this.loading = false
  },
  methods: {
    progressNum(right, wrong) {
      const sum = right + wrong
      return sum > 0 ? right / sum : 0
    },
    decoder(str) {
      return decodeHtml(str)
    },
    getSum(right, wrong) {
      return right + wrong
    },
    goToStart() {
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
    },
    async confirmReset() {
      const alert = await alertController.create({
        header: 'Reset Stats?',
        message: 'All stats, points and streaks will be deleted. This cannot be undone.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Reset',
            role: 'destructive',
            handler: () => {
              this.resetStats()
            }
          }
        ]
      })
      await alert.present()
    },
    async resetStats() {
      this.loading = true
      await resetStats()
      this.stats = await getStats()
      this.loading = false
    }
  }
}
</script>

<style scoped>

</style>
