<template>
  <ion-page>
    <base-layout>

      <ion-item>
        <ion-label>Difficulty:</ion-label>
        <ion-select v-model="settings.difficulty" interface="action-sheet" cancel-text="Abbrechen"
                    @ionChange="setDifficulty">
          <ion-select-option value="rand">Random</ion-select-option>
          <ion-select-option value="easy">Easy</ion-select-option>
          <ion-select-option value="medium">Medium</ion-select-option>
          <ion-select-option value="hard">Hard</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>Category:</ion-label>
        <ion-select v-model="settings.category" interface="action-sheet" cancel-text="Abbrechen"
                    @ionChange="setCategory">
          <ion-select-option value="rand">Random</ion-select-option>
          <ion-select-option v-for="cat in categories" :value="cat.param" v-bind:key="cat.param">
            {{ cat.name }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <div id="container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              {{ points }} Points
            </ion-card-title>
          </ion-card-header>
        </ion-card>
        <ion-button size="large" expand="block" v-on:click="startQuiz">
          Start Quiz
        </ion-button>
      </div>
    </base-layout>
  </ion-page>
</template>

<script>
import router from "@/router";
import {
  IonPage,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/vue';
import BaseLayout from "@/views/base/BaseLayout";
import {Plugins} from "@capacitor/core";
import {getCategories} from "@/services/questions";

const {Storage} = Plugins;

export default {
  name: 'Home',
  components: {
    BaseLayout,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
  },
  data() {
    return {
      points: 0,
      settings: {
        difficulty: 'rand',
        category: 'rand'
      },
      categories: []
    }
  },
  async mounted() {
    this.settings.difficulty = (await Storage.get({key: 'difficulty'})).value
    this.settings.category = (await Storage.get({key: 'category'})).value
    if (!this.settings.difficulty) {
      await Storage.set({key: 'difficulty', value: 'rand'})
      this.settings.difficulty = 'rand'
    }
    if (!this.settings.category) {
      await Storage.set({key: 'category', value: 'rand'})
      this.settings.category = 'rand'
    }

    this.categories = getCategories()

    const points = (await Storage.get({key: 'points'})).value
    if (points) {
      this.points = points
    } else {
      await Storage.set({key: 'points', value: '0'})
      this.points = 0
    }
  },
  async updated() {
    this.points = (await Storage.get({key: 'points'})).value
  },
  methods: {
    startQuiz() {
      router.push('/quiz');
    },
    async setDifficulty($event) {
      this.settings.difficulty = $event.target.value
      await Storage.set({key: 'difficulty', value: this.settings.difficulty})
    },
    async setCategory($event) {
      this.settings.category = $event.target.value
      await Storage.set({key: 'category', value: this.settings.category})
    }
  },

}
</script>

<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
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
</style>
