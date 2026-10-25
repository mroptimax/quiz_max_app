<template>
  <ion-page>
    <base-layout>
      <div id="container">

        <!-- Score -->
        <ion-card class="score-card">
          <ion-card-content>
            <div class="points">{{ points }}</div>
            <div class="points-label">Points</div>
            <div class="best-streak" v-if="bestStreak > 0">
              <ion-icon :icon="flame" color="warning"/>
              Best streak: <b>{{ bestStreak }}</b>
            </div>
            <ion-button v-on:click="goToStats" fill="outline" expand="block" class="stats-button">
              <ion-icon :icon="statsChart" slot="start"/>
              Stats
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Settings -->
        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-subtitle>Settings</ion-card-subtitle>
          </ion-card-header>
          <ion-list>
            <ion-item lines="full">
              <ion-select v-model="settings.difficulty" interface="action-sheet" cancel-text="Cancel"
                          @ionChange="setDifficulty" label="Difficulty">
                <ion-select-option value="rand">Random</ion-select-option>
                <ion-select-option value="easy">Easy</ion-select-option>
                <ion-select-option value="medium">Medium</ion-select-option>
                <ion-select-option value="hard">Hard</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item lines="none">
              <ion-select v-model="settings.category" interface="action-sheet" cancel-text="Cancel"
                          @ionChange="setCategory" label="Category">
                <ion-select-option value="rand">Random</ion-select-option>
                <ion-select-option v-for="cat in categories" :value="cat.param" v-bind:key="cat.param">
                  {{ cat.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
        </ion-card>

      </div>

      <!-- Start, in the footer so it is always visible regardless of screen size -->
      <template #footer>
        <ion-button size="large" expand="block" v-on:click="startQuiz" color="success" id="start_button">
          <b>Start Quiz</b>
        </ion-button>
        <p class="footer-info">
          {{ env.version }} · by mroptimax ·
          <a href="https://github.com/mroptimax/quiz_max_app#privacy-policy" target="_blank" rel="noopener">
            Privacy Policy
          </a>
        </p>
      </template>
    </base-layout>
  </ion-page>
</template>

<script>
import router from "@/router";
import {flame, statsChart} from "ionicons/icons";
import {
  IonPage,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonButton, IonItem, IonList
} from '@ionic/vue';
import BaseLayout from "@/views/base/BaseLayout";
import {Preferences} from '@capacitor/preferences';
import {getCategories} from "@/services/questions";
import {getStreak, setupStats} from "@/services/stats";
import env from "/env";


export default {
  name: 'HomePage',
  components: {
    BaseLayout,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    IonButton, IonItem, IonList
  },
  setup() {
    return {
      env
    }
  },
  data() {
    return {
      points: 0,
      bestStreak: 0,
      flame,
      settings: {
        difficulty: 'rand',
        category: 'rand'
      },
      categories: [],
      statsChart
    }
  },
  async mounted() {
    this.settings.difficulty = (await Preferences.get({key: 'difficulty'})).value
    this.settings.category = (await Preferences.get({key: 'category'})).value
    let stats = (await Preferences.get({key: 'stats'})).value

    if (!this.settings.difficulty) {
      await Preferences.set({key: 'difficulty', value: 'rand'})
      this.settings.difficulty = 'rand'
    }
    if (!this.settings.category) {
      await Preferences.set({key: 'category', value: 'rand'})
      this.settings.category = 'rand'
    }

    this.categories = getCategories()

    if (!stats) {
      await setupStats()
    }
  },
  // the page stays mounted while navigating, so refresh points and streak every time it is shown
  async ionViewWillEnter() {
    await this.loadPoints()
    this.bestStreak = (await getStreak()).best
  },
  methods: {
    async loadPoints() {
      const points = (await Preferences.get({key: 'points'})).value
      if (points) {
        this.points = parseInt(points) || 0
      } else {
        await Preferences.set({key: 'points', value: '0'})
        this.points = 0
      }
    },
    startQuiz() {
      router.push('/quiz');
    },
    goToStats() {
      router.push('/stats');
    },
    async setDifficulty($event) {
      this.settings.difficulty = $event.target.value
      await Preferences.set({key: 'difficulty', value: this.settings.difficulty})
    },
    async setCategory($event) {
      this.settings.category = $event.target.value
      await Preferences.set({key: 'category', value: this.settings.category})
    }
  }

}
</script>

<style scoped>
.score-card {
  text-align: center;
}

.points {
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  color: var(--ion-color-primary);
}

.points-label {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--ion-color-step-600, #666666);
}

.best-streak {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  font-size: 15px;
}

.stats-button {
  margin-top: 16px;
}

.settings-card ion-card-header {
  padding-bottom: 0;
}

#start_button {
  height: 60px;
  margin: 0;
  --border-radius: 14px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-success-rgb), 0.4);
  font-size: 20px;
  color: white;
}

/* small phones: more room for the settings */
@media (max-height: 700px) {
  .points {
    font-size: 44px;
  }
}

.footer-info {
  margin: 8px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--ion-color-step-500, #8c8c8c);
}

.footer-info a {
  color: inherit;
}
</style>
