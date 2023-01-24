<template>
  <v-app>
    <v-bottom-navigation :value="actualFilter" color="primary" style="box-shadow: none">
      <v-btn min-width="133" @click="filter('all')" text tile x-large>
        <span>TODOS</span>
      </v-btn>
      <v-btn min-width="133" @click="filter('prod')" text tile x-large>
        <span>PRODUÇÃO</span>
      </v-btn>
      <v-btn min-width="133" @click="filter('hom')" text tile x-large>
        <span>HOMOLOGAÇÃO</span>
      </v-btn>
    </v-bottom-navigation>
    <v-divider/>
    <p class="text-subtitle-1 text-center pa-2" v-if="items.length === 0">Nenhum item adicionado</p>
    <v-virtual-scroll v-else :items="items" height="508" item-height="64">
      <template v-slot:default="{ item }">
        <ListItem :item="item" @selectItem="image => editItem(image)" @beforeBuilder="updateItems"/>
      </template>
    </v-virtual-scroll>

    <v-footer absolute padless class="justify-center">
      <v-dialog v-model="settingsModal" persistent fullscreen hide-overlay no-click-animation
                transition="dialog-bottom-transition">
        <template v-slot:activator="{on, attrs}">
          <v-btn icon tile title="Adicionar builder" v-bind="attrs" v-on="on">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <ModalBuilder :selectedItem="selectedItem" @close="finish => onClose(finish)"/>
      </v-dialog>
    </v-footer>

    <v-dialog v-model="notConfigured" persistent fullscreen hide-overlay no-click-animation>
      <ModalSettings @close="nc => notConfigured = nc"/>
    </v-dialog>
  </v-app>
</template>

<script>
import ListItem from "@/components/ListItem";
import ModalBuilder from "@/components/ModalBuilder";
import ModalSettings from "@/components/ModalSettings";

export default {
  name: 'App',
  components: {ModalSettings, ModalBuilder, ListItem},
  data() {
    return {
      items: [],
      actualFilter: 0,
      notConfigured: false,
      settingsModal: false,
      selectedItem: {
        name: '',
        image: '',
        version: '',
        path: ''
      }
    }
  },
  async created() {
    this.notConfigured = !await window.ipcRenderer.invoke('is-configured');

    if (!this.notConfigured) {
      await this.updateItems();
    }
  },
  methods: {
    async filter(profile) {
      await this.updateItems();

      if ('all' !== profile) {
        this.items = this.items.filter(item => item.profile === profile);
      }
    },
    async updateItems() {
      const list = await window.ipcRenderer.invoke('list-builders');
      this.items = list.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    },
    async editItem(image) {
      this.selectedItem = await window.ipcRenderer.invoke('get-builder', image);
      this.settingsModal = true;
    },
    onClose(finish) {
      this.settingsModal = false;
      this.selectedItem = {
        name: '',
        version: '',
        path: ''
      }

      if (finish) {
        this.updateItems();
      }
    }
  }
};
</script>

<style>
::-webkit-scrollbar {
  display: none;
}

.right-0 {
  right: 0;
}
</style>
