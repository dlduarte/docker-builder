<template>
  <v-card>
    <v-toolbar dark color="primary">
      <v-btn icon dark @click="$emit('close', false)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
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
            <v-text-field v-model="builder.name" label="Nome" @input="e => hyphenation(e)"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="builder.image" label="Nome da imagem"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="builder.version" label="Versão"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="builder.path" label="Local do dockerfile"></v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="builder.id">
          <v-col cols="12" md="4">
            <BottomSheet
                actionButton="REMOVER"
                confirmButton="CONFIRMAR"
                cancelButton="CANCELAR"
                description="Deseja realmente excluir este builder?"
                @confirm="remove"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>

<script>
import BottomSheet from "@/components/BottomSheet";

export default {
  name: "ModalBuilder",
  components: {BottomSheet},
  props: {
    selectedItem: {
      default: () => {
      },
      type: Object
    }
  },
  data() {
    return {
      sheet: false,
      builder: {name: '', image: '', version: '', path: ''}
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
    hyphenation(newValue) {
      this.builder.image = newValue
          .toLowerCase()
          .replaceAll(' ', '-');
    },
    save() {
      window.ipcRenderer.send('save-builders', this.builder);
      this.$emit('close', true);
    },
    remove() {
      window.ipcRenderer.send('remove-builders', this.builder.id);
      this.sheet = false;
      this.$emit('close', true);
    }
  }
}
</script>