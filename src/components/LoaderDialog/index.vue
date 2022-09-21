<template>
  <v-dialog v-model="control" persistent no-click-animation width="auto">
    <v-card color="white">
      <v-card-text class="text-center pa-0">
        <v-progress-circular class="ma-2" color="primary" size="48" indeterminate></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "LoaderDialog",
  props: {
    modal: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      control: false
    }
  },
  watch: {
    modal(val) {
      this.control = val;
    }
  },
  methods: {
    close() {
      this.control = false;
    }
  }
}
</script>