<template>
  <ion-page>
    <base-layout back>

      <ion-card v-if="loading" class="hcenter">
        <ion-spinner name="crescent"/>
      </ion-card>
      <div v-else>

        <!-- Total Stats -->
        <ion-grid class="tiles">
          <ion-row>
            <ion-col>
              <div class="tile">
                <div class="tile-value">{{ stats.count }}</div>
                <div class="tile-label">Answered</div>
              </div>
            </ion-col>
            <ion-col>
              <div class="tile">
                <div class="tile-value">{{ percent(getTotal(true), getTotal(false)) }}%</div>
                <div class="tile-label">Correct</div>
              </div>
            </ion-col>
            <ion-col>
              <div class="tile">
                <div class="tile-value">
                  <ion-icon :icon="flame" color="warning"/>{{ bestStreak }}
                </div>
                <div class="tile-label">Best streak</div>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <p class="empty" v-if="getSum(getTotal(true), getTotal(false)) === 0">
          No questions answered yet. Start a quiz to see your stats here.
        </p>

        <!-- Each Category -->
        <template v-for="(catStats, cat) in stats" v-bind:key="cat">
          <ion-card v-if="cat !== 'count' && getSum(getCategoryTotal(catStats, true), getCategoryTotal(catStats, false)) > 0">
            <ion-card-header>
              <ion-card-title class="category-title">{{ decoder(cat) }}</ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <!-- Category Total -->
              <div class="line total">
                <span>Total ({{ getSum(getCategoryTotal(catStats, true), getCategoryTotal(catStats, false)) }})</span>
                <span>{{ percent(getCategoryTotal(catStats, true), getCategoryTotal(catStats, false)) }}%</span>
              </div>
              <ion-progress-bar :value="progressNum(getCategoryTotal(catStats, true), getCategoryTotal(catStats, false))"
                                color="primary"></ion-progress-bar>

              <!-- Each Difficulty in Category -->
              <template v-for="(data, diff) in catStats" v-bind:key="diff">
                <div v-if="getSum(data.right, data.wrong) > 0" class="difficulty">
                  <div class="line">
                    <span>{{ capitalize(diff) }} ({{ getSum(data.right, data.wrong) }})</span>
                    <span>{{ percent(data.right, data.wrong) }}%</span>
                  </div>
                  <ion-progress-bar :value="progressNum(data.right, data.wrong)"
                                    :color="getColor(diff)"></ion-progress-bar>
                </div>
              </template>
            </ion-card-content>
          </ion-card>
        </template>
      </div>

      <ion-button expand="block" color="danger" fill="outline" class="reset-button" v-on:click="confirmReset">
        Reset Stats
      </ion-button>

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
  IonGrid,
  IonRow,
  IonCol,
  IonIcon, IonProgressBar, IonCardTitle, IonButton,
  alertController
} from "@ionic/vue";
import {flame} from "ionicons/icons";
import {getStats, getStreak, resetStats} from "@/services/stats";
import {decodeHtml} from "@/services/text";


export default {
  name: "StatsPage",
  components: {
    IonSpinner,
    IonPage,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar,
    IonIcon, IonCardTitle, IonButton
  },
  data() {
    return {
      stats: null,
      bestStreak: 0,
      loading: true,
      flame
    }
  },
  // also runs on the first visit, so no extra loading in mounted() needed
  async ionViewWillEnter() {
    await this.loadStats()
  },
  methods: {
    async loadStats() {
      this.loading = true
      this.stats = await getStats()
      this.bestStreak = (await getStreak()).best
      this.loading = false
    },
    progressNum(right, wrong) {
      const sum = right + wrong
      return sum > 0 ? right / sum : 0
    },
    percent(right, wrong) {
      return Math.round(this.progressNum(right, wrong) * 100)
    },
    decoder(str) {
      return decodeHtml(str)
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    getSum(right, wrong) {
      return right + wrong
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
          sum += this.getCategoryTotal(data, right);
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
      await this.loadStats()
    }
  }
}
</script>

<style scoped>
.tiles {
  padding: 16px 10px 0;
}

.tile {
  height: 100%;
  padding: 14px 4px;
  border-radius: 12px;
  text-align: center;
  background: var(--ion-card-background, #ffffff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tile-value {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  font-size: 26px;
  font-weight: 800;
  color: var(--ion-color-primary);
}

.tile-label {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--ion-color-step-600, #666666);
}

.empty {
  margin: 24px 16px;
  text-align: center;
  color: var(--ion-color-step-600, #666666);
}

.category-title {
  font-size: 18px;
}

.line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.line.total {
  font-weight: 700;
  color: var(--ion-text-color, #000000);
}

.difficulty {
  margin-top: 12px;
  padding-left: 10px;
}

.reset-button {
  margin: 16px;
}
</style>
