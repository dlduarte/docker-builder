<template>
  <v-list-item-group>
    <v-list-item inactive>
      <v-list-item-avatar>
        <v-btn icon @click="openModal">
          <v-icon color="green" title="Cria imagem">mdi-play</v-icon>
        </v-btn>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.version }}</v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-btn icon @click="select">
          <v-icon title="Configurar imagem">mdi-cog</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-divider/>
    <v-dialog v-model="modal" persistent>
      <v-card>
        <v-card-title class="text-h5">
          Informações da imagem
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="builder.image" label="Nome da imagem" hide-details></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="builder.version" label="Versão" hide-details></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-checkbox class="pa-0 ma-0" v-model="updateBuilder" label="Salvar alterações"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
              color="error darken-1"
              text
              @click="modal = false"
          >
            cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
              color="green darken-1"
              text
              @click="build"
          >
            gerar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <LoaderDialog :modal="modalAwait"/>
  </v-list-item-group>
</template>

<script>
import LoaderDialog from "@/components/LoaderDialog";

export default {
  name: "ListItem",
  components: {LoaderDialog},
  props: {
    item: Object
  },
  data() {
    return {
      modal: false,
      modalAwait: false,
      updateBuilder: true,
      builder: {
        image: '',
        version: '',
        path: ''
      }
    }
  },
  methods: {
    openModal() {
      this.builder = {...this.item};
      this.updateBuilder = true;
      this.modal = true;
    },
    async build() {
      await window.ipcRenderer.send(
          'publish-docker-image',
          this.builder.image,
          this.builder.version,
          this.builder.path
      );

      this.modalAwait = true;

      await window.ipcRenderer.on('publish-docker-image', success => {
        if (success) {
          if (this.updateBuilder) {
            window.ipcRenderer.send('save-builders', this.builder);
          }

          window.ipcRenderer.invoke('notify', `Imagem ${this.builder.image}:${this.builder.version}`, 'Publicado com sucesso')

          this.modal = false;
          this.$emit('beforeBuilder');
        }

        this.modalAwait = false;
      })

    },
    select() {
      this.$emit('selectItem', this.item.id)
    }
  }
}
</script>