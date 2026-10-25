<template>

  <!-- Header -->
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start" v-if="back">
        <ion-button v-on:click="goToStart" aria-label="Back">
          <ion-icon slot="icon-only" :icon="arrowBack"/>
        </ion-button>
      </ion-buttons>
      <ion-title class="hcenter title" v-on:click="goToStart">
        Quiz Max
      </ion-title>
      <!-- same width as the back button, keeps the title centered -->
      <ion-buttons slot="end" v-if="back">
        <div class="back-spacer"/>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <!-- Content -->
  <ion-content mode="ios">
    <slot/>
  </ion-content>

  <!-- Footer, only for pages that pass one -->
  <ion-footer v-if="$slots.footer">
    <ion-toolbar>
      <div class="footer-content">
        <slot name="footer"/>
      </div>
    </ion-toolbar>
  </ion-footer>

</template>
<script>
import router from "@/router";
import {arrowBack} from "ionicons/icons";
import {
  IonHeader,
  IonTitle,
  IonContent,
  IonToolbar,
  IonFooter,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/vue';

export default {
  name: "BaseLayout",
  components: {
    IonHeader,
    IonTitle,
    IonContent,
    IonToolbar,
    IonFooter,
    IonButtons,
    IonButton,
    IonIcon
  },
  props: {
    // shows a back button that leads to the start page
    back: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      arrowBack
    }
  },
  methods: {
    goToStart() {
      router.push('/home');
    }
  }
}
</script>
<style scoped>
.title {
  font-weight: 700;
  color: var(--ion-color-primary);
}

.back-spacer {
  width: 48px;
}

.footer-content {
  padding: 8px 16px;
}
</style>
