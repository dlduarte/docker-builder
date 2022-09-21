<template>
  <v-card>
    <v-toolbar dark color="primary">
      <v-toolbar-title>Configurações</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
            dark
            text
            @click="save"
        >
          Salvar
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-form>
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="config.host" label="Endereço do nexus"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="config.user" label="Usuário do nexus"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="config.password" label="Senha do nexus"></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <LoaderDialog :modal="modalAwait"/>
  </v-card>
</template>

<script>
import LoaderDialog from "@/components/LoaderDialog";

export default {
  name: "ModalSettings",
  components: {LoaderDialog},
  props: {
    selectedItem: {
      default: () => {
      },
      type: Object
    }
  },
  data() {
    return {
      modalAwait: false,
      config: {
        host: '',
        user: '',
        password: ''
      }
    }
  },
  watch: {
    selectedItem: {
      async handler(selectedItem) {
        this.builder = selectedItem;
      },
      immediate: true
    }
  },
  methods: {
    async save() {
      await window.ipcRenderer.send('configure', this.config);

      this.modalAwait = true;

      await window.ipcRenderer.on('configure', success => {
        this.modalAwait = false;
        this.$emit('close', !success);
      })
    }
  }
}
</script>