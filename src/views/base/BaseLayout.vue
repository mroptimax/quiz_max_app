<template>

  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-title class="hcenter"> Quiz Max</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content :fullscreen="true">
    <slot/>
  </ion-content>

  <ion-footer style="color: #1e2023">
    <ion-grid>
      <ion-row>
        <ion-col>
          v. 1.0.3
        </ion-col>
        <ion-col>
          by mroptimax
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-footer>

</template>
<script>
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
  }, data() {
    return {}
  },
  methods: {}
}
</script>
<style scoped>

</style>
