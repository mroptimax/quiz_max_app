<template>

  <!-- Header -->
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-row style="">
        <ion-title class="hcenter" v-on:click="gotToStart">
          Quiz Max
        </ion-title>
      </ion-row>

    </ion-toolbar>
  </ion-header>

  <!-- Content -->
  <ion-content mode="ios">
    <slot/>
  </ion-content>

  <!-- Footer -->
  <ion-footer>
    <ion-toolbar>
      <ion-grid>
        <ion-row>
          <ion-col>
            <b>{{ env.version }}</b>
          </ion-col>
          <ion-col>
            <b>by mroptimax</b>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-toolbar>
  </ion-footer>

</template>
<script>
import router from "@/router";
import {
  IonHeader,
  IonTitle,
  IonContent,
  IonToolbar,
  IonFooter,
  IonCol,
  IonRow, IonGrid
} from '@ionic/vue';
import env from "/env";

export default {
  name: "BaseLayout",
  components: {
    IonHeader,
    IonTitle,
    IonContent,
    IonToolbar,
    IonFooter,
    IonCol,
    IonRow,
    IonGrid
  },
  setup() {
    return {
      env
    }
  },
  data() {
    return {

    }
  },
  methods: {
    gotToStart() {
      router.push('/home');
    }
  }
}
</script>
<style scoped>

</style>
