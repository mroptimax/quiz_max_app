<template>

  <!-- Header -->
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-title class="hcenter" v-on:click="gotToStart"> Quiz Max</ion-title>
    </ion-toolbar>
  </ion-header>

  <!-- Content -->
  <ion-content>
    <slot/>
  </ion-content>

  <!-- Footer -->
  <ion-footer style="color: white" translucent="false">
    <ion-grid>
      <ion-row>
        <ion-col>
          v. 1.0.6
        </ion-col>
        <ion-col>
          by mroptimax
        </ion-col>
      </ion-row>
    </ion-grid>
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
  IonRow
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
    IonRow
  },
  data() {
    return {}
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
