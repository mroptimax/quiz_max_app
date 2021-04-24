<template>
  <ion-page>
    <base-layout>

      <ion-card v-if="loading" class="hcenter">
        <ion-spinner name="crescent"/>
      </ion-card>
      <div v-if="!loading">

        <ion-card>
          <ion-card-header>
            <ion-card-title>
              Total of <b>{{ stats.count }}</b> Questions answered
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-for="(stats, cat) in stats" v-bind:key="cat">
              <div v-if=" cat !== 'count'">
                <h4><b>{{ cat }}</b></h4>
                <ul>
                  <li v-for="(data, diff) in stats" v-bind:key="diff">
                    {{ diff }} ({{ getSum(data.right, data.wrong) }}):
                    {{ Math.round(progressNum(data.right, data.wrong) * 100) }}%
                    <ion-progress-bar :value="progressNum(data.right, data.wrong)" color="success"
                                      v-if="getSum(data.right, data.wrong) > 0"></ion-progress-bar>
                  </li>
                </ul>
              </div>
            </div>

          </ion-card-content>
        </ion-card>

      </div>

    </base-layout>
  </ion-page>
</template>

<script>
import {IonSpinner, IonPage} from "@ionic/vue";
import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;

export default {
  name: "Stats",
  components: {
    IonSpinner, IonPage
  },
  data() {
    return {
      stats: null,
      loading: true
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
    }
  }
}
</script>

<style scoped>

</style>
