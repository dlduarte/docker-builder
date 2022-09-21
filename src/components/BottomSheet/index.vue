<template>
  <v-bottom-sheet v-model="control" inset>
    <template v-slot:activator="{on, attrs}">
      <v-btn color="error" dark v-bind="attrs" v-on="on">
        {{actionButton}}
      </v-btn>
    </template>
    <v-sheet class="text-center" height="150px">
      <v-btn class="mt-6" text color="error" @click="close()">
        {{cancelButton}}
      </v-btn>
      <v-btn class="mt-6" text color="primary" @click="listener()">
        {{confirmButton}}
      </v-btn>
      <div class="my-3">
        {{description}}
      </div>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
export default {
  name: "BottomSheet",
  props: {
    actionButton: String,
    confirmButton: String,
    cancelButton: String,
    description: String
  },
  data() {
    return {
      control: false
    }
  },
  methods: {
    close() {
      this.control = false;
    },
    listener() {
      this.$emit('confirm')
    }
  }
}
</script>