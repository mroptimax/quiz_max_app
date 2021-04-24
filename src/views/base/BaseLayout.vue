<template>

  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-title class="hcenter" v-on:click="gotToStart"> Quiz Max</ion-title>
      <ion-buttons slot="end">
        <ion-button v-on:click="goToStats">
          <ion-icon :icon="statsChart" size="large"/>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content :fullscreen="true">
    <slot/>
  </ion-content>

  <ion-footer style="color: white" >
    <ion-grid>
      <ion-row>
        <ion-col>
          v. 1.0.4
        </ion-col>
        <ion-col>
          by mroptimax
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-footer>

</template>
<script>
import {statsChart} from "ionicons/icons";
import router from "@/router";
import {
  IonHeader,
  IonTitle,
  IonContent,
  IonToolbar,
  IonFooter,
  IonCol,
  IonRow,
  IonIcon,
  IonButton,
  IonButtons
} from '@ionic/vue';


export default {
  name: "BaseLayout",
  components: {
    IonHeader,
    IonTitle,
    IonContent,
    IonToolbar,
    IonFooter,
    IonCol,
    IonRow, IonIcon, IonButton, IonButtons
  }, data() {
    return {statsChart}
  },
  methods: {
    gotToStart() {
      router.push('/home');
    },
    goToStats() {
      router.push('/stats');
    }
  }
}
</script>
<style scoped>

</style>
