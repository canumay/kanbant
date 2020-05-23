<template>
  <div class="h-100" :style="getBackgroundCustomization">
    <Navbar />
    <b-sidebar
      id="sidebar-1"
      title="Customization"
      :bg-variant="getSidebarBGVariant"
      :text-variant="getSidebarTextVariant"
      backdrop
      shadow
      right
    >
      <div class="px-3 py-2">
        <p>Kanbant provides lots of customizations. You can customize the appearance of your dashboard.</p>
        <hr />
        <b-form-group label="Theme Mode:">
          <b-form-radio-group
            v-model="customization.theme.selected"
            :options="customization.theme.options"
          ></b-form-radio-group>
        </b-form-group>
        <b-form-group label="Hide Icons:">
          <b-form-radio-group
            v-model="customization.icons.selected"
            :options="customization.icons.options"
          ></b-form-radio-group>
        </b-form-group>
        <b-form-group label="Background:">
          <b-form-radio-group
            v-model="customization.background.selected"
            :options="customization.background.options"
            style="display:grid;"
          ></b-form-radio-group>
        </b-form-group>
      </div>
    </b-sidebar>
    <div style="height: 40px; margin-top: 10px;">
      <multiselect
        v-model="projects.selected"
        track-by="_id"
        label="title"
        placeholder
        class="ml-4 mt-2"
        style="width: auto; display: inline-block;"
        selectLabel
        :options="projects.options"
        :searchable="true"
        :allow-empty="false"
        :hide-selected="true"
        @select="projectSelected"
      >
        <template slot="singleLabel" slot-scope="{ option }">
          <strong>{{ option.title }}</strong>
        </template>
        <template slot="option" slot-scope="props">
          <div class="option__desc">
            <i class="fas fa-tasks" style="margin-right: 10px;"></i>
            <span class="option__title">{{ props.option.title }}</span>
            <span
              :class="`badge badge-${props.option.labelType} float-right`"
            >{{props.option.label}}</span>
          </div>
        </template>
      </multiselect>
      <i
        class="fas fa-cog text-white float-right mr-3 mt-3"
        style="font-size: 25px;"
        v-b-toggle.sidebar-1
      ></i>
    </div>
    <br />
    <PerfectScrollbar class="scroll-area" v-if="loaded">
      <b-container style="max-width: none !important;">
        <b-row>
          <b-col class="d-flex">
            <b-col
              class="col kanban-widget"
              v-for="(column, index) in project_details.columns"
              :key="index"
            >
              <b-card
                tag="article"
                class="mb-2 widget-img kanban-widget text-center p-2"
                :class="getColumnCustomization"
                :style="getColumnStyle"
              >
                <template>
                  <h4
                    class="card-title"
                    @dblclick="editing_component_id = column._id"
                    v-show="editing_component_id !== column._id"
                  >{{column.title}}</h4>
                  <span
                    style="position: absolute; top: 0px; right:10px; cursor:pointer;"
                    @click.prevent.stop="columnHandle($event, column)"
                  >
                    <i class="fas fa-ellipsis-h"></i>
                  </span>
                  <b-form-input
                    type="text"
                    @focusout="updateColumnTitle(column._id, column.title)"
                    tabindex="0"
                    v-if="editing_component_id === column._id"
                    v-model="column.title"
                    @keyup.enter="editing_component_id = null;"
                    style="width: auto; margin: auto;"
                  />
                </template>
                <span class="mb-2" style="display:block;">({{column.tasks.length}})</span>
                <b-img :src="getColumnIcon(column.icon)" v-show="!customization.icons.selected" />
                <draggable
                  class="list-group text-left mt-4"
                  :list="column.tasks"
                  style="cursor:move; min-height: 100px;"
                  group="people"
                  ghost-class="ghost"
                  @change="changed(column._id, $event)"
                  :animation="200"
                >
                  <b-card
                    class="mb-2 text-left task"
                    :class="getTaskCustomization"
                    :style="getTaskHeight(element)"
                    v-for="(element) in column.tasks"
                    @contextmenu.prevent.stop="e => {element['column_id'] = column._id; taskHandle($event, element)}"
                    :key="element._id"
                  >
                    <h4 class="card-title">{{element.title}}</h4>
                    <span
                      style="position: absolute; top: 0px; cursor:pointer;"
                      @click.prevent.stop="e => {element['column_id'] = column._id; taskHandle($event, element)}"
                    >
                      <i class="fas fa-ellipsis-h"></i>
                    </span>
                    <p v-if="element.expireAt">
                      <i class="fa fa-clock" />
                      {{element.expireAt | moment('MMMM D')}}
                    </p>
                    <span
                      :class="`badge badge-${element.labelType}`"
                      style="text-transform:capitalize; font-size: 0.635rem"
                      v-if="element.labelType"
                    >
                      <i class="fas fa-circle" />
                      {{element.label}}
                    </span>
                  </b-card>
                </draggable>
                <hr :style="getHRStyle" />
                <i class="fa fa-plus"></i>
              </b-card>
            </b-col>
          </b-col>
        </b-row>
      </b-container>
    </PerfectScrollbar>
    <vue-simple-context-menu
      :elementId="'taskMenu'"
      :options="options"
      :ref="'vueTaskContextMenu'"
      @option-clicked="taskOptionSelected"
    ></vue-simple-context-menu>
    <vue-simple-context-menu
      :elementId="'columnMenu'"
      :options="options"
      :ref="'vueColumnContextMenu'"
      @option-clicked="columnOptionSelected"
    ></vue-simple-context-menu>
  </div>
</template>

<script>
import Navbar from "./Navbar";
import draggable from "vuedraggable";
import { PerfectScrollbar } from "vue2-perfect-scrollbar";
import Multiselect from "vue-multiselect";
// import VueContentLoading from "vue-content-loading"; // TODO: implement this
export default {
  components: {
    Navbar,
    draggable,
    PerfectScrollbar,
    Multiselect
    // VueContentLoading
  },
  watch: {
    "customization.theme.selected": {
      handler: val => {
        localStorage.theme = val;
      },
      deep: true
    },
    "customization.background.selected": {
      handler: val => {
        localStorage.bg = val;
      },
      deep: true
    },
    "customization.icons.selected": {
      handler: val => {
        localStorage.icons = val;
      },
      deep: true
    }
  },
  data() {
    return {
      projects: {
        selected: {},
        options: []
      },
      loaded: false,
      project_details: { title: "", description: "", columns: [] },
      editing_component_id: "",
      options: [
        {
          name: "Clone",
          slug: "clone"
        },
        {
          name: "Edit",
          slug: "edit"
        },
        {
          name: "Delete",
          slug: "delete"
        }
      ],
      customization: {
        theme: {
          selected: "Dark",
          options: ["Dark", "Light"]
        },
        background: {
          selected: "Random",
          options: [
            "Random",
            "Solid Dark",
            "Blueish",
            "Valley",
            "Mountain",
            "City",
            "Seaside",
            "Northen Lights"
          ]
        },
        icons: {
          selected: false,
          options: [
            { text: "Yes", value: true },
            { text: "No", value: false }
          ]
        }
      }
    };
  },
  computed: {
    getSidebarBGVariant() {
      if (this.customization.theme.selected === "Dark") {
        return "dark";
      }
      return "light";
    },
    getSidebarTextVariant() {
      if (this.customization.theme.selected === "Dark") {
        return "light";
      }
      return "dark";
    },
    getBackgroundCustomization() {
      switch (this.customization.background.selected) {
        case "Solid Dark":
          return `background: linear-gradient(140deg,#151a1f 4%,rgb(43, 41, 41) 13%,#102225 98%);`;
        case "Blueish":
          return `background: linear-gradient(180deg,rgb(50, 43, 167) 0%,rgb(69, 69, 175) 53%,rgba(0, 212, 255, 1) 100%);`;
        case "Valley":
          return "background-image: url('https://i.picsum.photos/id/1015/0/0.jpg');background-size: cover !important;";
        case "Mountain":
          return "background-image: url('https://i.picsum.photos/id/866/0/0.jpg');background-size: cover !important;";
        case "City":
          return "background-image: url('https://i.picsum.photos/id/122/4147/2756.jpg');background-size: cover !important;";
        case "Seaside":
          return "background-image: url('https://i.picsum.photos/id/1019/0/0.jpg');background-size: cover !important;";
        case "Northen Lights":
          return "background-image: url('https://i.picsum.photos/id/1022/0/0.jpg');background-size: cover !important;";
        default:
          return "background-image: url('https://picsum.photos/0/0');background-size: cover !important;";
      }
    },
    getTaskCustomization() {
      if (this.customization.theme.selected === "Dark") {
        return "bg-dark text-white";
      }
      return "";
    },
    getColumnCustomization() {
      if (this.customization.theme.selected === "Dark") {
        return "text-white";
      }
      return "";
    },
    getColumnStyle() {
      if (this.customization.theme.selected === "Dark") {
        return "background-color: #1e242b; border: 2px double #ffffff1c;";
      }
      return "background-color: rgb(241, 241, 241);";
    },
    getHRStyle() {
      if (this.customization.theme.selected === "Dark") {
        return "border-top: 1px solid rgba(255, 255, 255, 0.21)";
      }
      return "";
    }
  },
  methods: {
    checkLocalStorage() {
      if (localStorage.theme) {
        if (this.customization.theme.options.includes(localStorage.theme)) {
          this.customization.theme.selected = localStorage.theme;
        }
      }
      if (localStorage.bg) {
        if (this.customization.background.options.includes(localStorage.bg)) {
          this.customization.background.selected = localStorage.bg;
        }
      }
      if (localStorage.icons) {
        if (localStorage.icons === "true") {
          this.customization.icons.selected = true;
        } else {
          this.customization.icons.selected = false;
        }
      }
    },
    taskHandle(event, item) {
      this.$refs.vueTaskContextMenu.showMenu(event, item);
    },
    taskOptionSelected(event) {
      if (event.option.slug === "delete") {
        this.$http
          .delete("/user/tasks", { params: { task_id: event.item._id } })
          .then(res => {
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            console.log(err.response);
          });
      } else if (event.option.slug === "clone") {
        let {
          title,
          expireAt,
          label,
          labelType,
          column_id
        } = event.item;
        this.$http
          .post("/user/tasks", {
            title,
            expireAt,
            label,
            labelType,
            column_id
          })
          .then(res => {
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            console.log(err.response);
          });
      }
    },
    columnHandle(event, item) {
      this.$refs.vueColumnContextMenu.showMenu(event, item);
    },
    columnOptionSelected(event) {
      if (event.option.slug === "delete") {
        this.$http
          .delete("/user/columns", { params: { column_id: event.item._id } })
          .then(res => {
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            console.log(err.response);
          });
      } else if (event.option.slug === "clone") {
        let { title, icon } = event.item;
        this.$http
          .post("/user/columns", {
            title,
            icon,
            project_id: this.projects.selected._id
          })
          .then(res => {
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            console.log(err.response);
          });
      }
    },
    updateColumnTitle(column_id, title) {
      this.editing_component_id = null;
      this.$http
        .put("/user/columns", { column_id, title })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.log(err.response);
        });
    },
    loadProject(project_id) {
      this.loaded = false;
      this.$http
        .get("/user/projects", {
          params: { project_id }
        })
        .then(response => {
          this.project_details = response.data.result;
          this.loaded = true;
        })
        .catch(err => {
          console.log(err.response);
        });
    },
    projectSelected(selectedOption) {
      this.loadProject(selectedOption._id);
    },
    getTaskName(name) {
      return name.length > 60 ? name.slice(0, 60) + "..." : name;
    },
    getColumnIcon(icon) {
      return require(`../../assets/svg/${icon}.svg`);
    },
    getTaskHeight(element) {
      if (element.date || element.label) {
        return "height: 90px";
      } else {
        return "height: 80px";
      }
    },
    changed: function(column_id, evt) {
      if (evt.added) {
        let task_id = evt.added.element._id;
        this.$http
          .post("/user/addToColumn", { task_id, column_id })
          .then(res => {
            console.log(res.data);
          })
          .catch(err => {
            console.log(err.response);
          });
      } else if (evt.removed) {
        let task_id = evt.removed.element._id;
        this.$http
          .post("/user/removeFromColumn", { task_id, column_id })
          .then(res => {
            console.log(res.data);
          })
          .catch(err => {
            console.log(err.response);
          });
      } else {
        console.log("Unknown process.");
      }
    }
  },
  created() {
    this.checkLocalStorage();
    this.$http.get("/user/projects").then(res => {
      if (res.data.status && res.data.status === true) {
        this.projects.options = res.data.results;
        if (this.projects.options.length > 0) {
          this.projects.selected = res.data.results[0];
          this.loadProject(res.data.results[0]._id);
        }
      } else {
        console.log("error occurred fetching projects.");
      }
    });
  }
};
</script>
<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css"/>
<style src="vue-multiselect/dist/vue-multiselect.min.css"/>
<style scoped>
.kanban-widget {
  padding: 0;
  margin: 5px;
  min-width: 40vh;
  max-width: 40vh;
  min-height: 50vh;
}
.widget-img img {
  max-height: 150px;
}
.task {
  display: flex;
  border-radius: 8px;
}
.task h4 {
  --text-opacity: 1;
  /* color: #4a5568;
  color: rgba(74, 85, 104, var(--text-opacity)); */
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
.task p {
  --text-opacity: 1;
  color: #718096;
  color: rgba(113, 128, 150, var(--text-opacity));
  font-size: 0.775rem;
  position: absolute;
  bottom: -5px;
  left: 20px;
}
.task span {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.775rem;
  border-radius: 9999px !important;
  padding: 0.5em 0.5em !important;
}
.scroll-area {
  max-height: 80vh;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
<style>
.multiselect__tags {
  background-color: #00ff0000 !important;
  border: none !important;
}
.multiselect__input,
.multiselect__single {
  color: white;
  font-size: 25px;
  background-color: #00ff0000 !important;
}
.multiselect__content-wrapper {
  border: none;
}
.multiselect__option--highlight {
  background: #2a2d2a;
}
.multiselect__option--highlight:after {
  background: #2a2d2a;
  border-radius: 2px;
}
</style>