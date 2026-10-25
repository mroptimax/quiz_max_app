<template>
  <ion-page>
    <base-layout>
      <div id="container">
        <ion-card>
          <ion-card-header>
            <ion-card-title style="text-align: center">
              {{ points }} Points
            </ion-card-title>
            <ion-card-subtitle style="text-align: center" v-if="bestStreak > 0">
              <ion-icon :icon="flame"/> Best streak: {{ bestStreak }}
            </ion-card-subtitle>
            <ion-card-content>
              <ion-button v-on:click="goToStats" expand="block">
                <ion-icon :icon="statsChart"/>
                Stats
              </ion-button>
            </ion-card-content>
          </ion-card-header>
        </ion-card>

        <ion-item lines="full">
          <ion-select v-model="settings.difficulty" interface="action-sheet" cancel-text="Cancel"
                      @ionChange="setDifficulty" label="Difficulty">
            <ion-select-option value="rand">Random</ion-select-option>
            <ion-select-option value="easy">Easy</ion-select-option>
            <ion-select-option value="medium">Medium</ion-select-option>
            <ion-select-option value="hard">Hard</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item lines="full">
          <ion-select v-model="settings.category" interface="action-sheet" cancel-text="Cancel"
                      @ionChange="setCategory" label="Category">
            <ion-select-option value="rand">Random</ion-select-option>
            <ion-select-option v-for="cat in categories" :value="cat.param" v-bind:key="cat.param">
              {{ cat.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <div id="start_button_box">
          <ion-button size="large" expand="block" v-on:click="startQuiz" color="success" id="start_button">
            <b>Start Quiz</b>
          </ion-button>
        </div>

      </div>
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
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonButton, IonItem
} from '@ionic/vue';
import BaseLayout from "@/views/base/BaseLayout";
import {Preferences} from '@capacitor/preferences';
import {getCategories} from "@/services/questions";
import {getStreak, setupStats} from "@/services/stats";


export default {
  name: 'HomePage',
  components: {
    BaseLayout,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    IonButton, IonItem
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
/* vertically centered, but grows and scrolls when the screen is too small */
#container {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}

#start_button_box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}

#start_button {
  padding: 0 15px;
  width: 200px;
  height: 150px;
  --border-radius: 50%;
  color: white;
}

</style>
