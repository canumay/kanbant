<template>
  <div class="background-template h-100">
    <Navbar />
    <div style="height: 40px; margin-bottom: 15px;">
      <h2 class="text-white ml-4 mt-2">Project: {{project_details.title}}</h2>
    </div>

    <PerfectScrollbar class="scroll-area">
      <b-container style="max-width: none !important;">
        <b-row>
          <b-col class="d-flex">
            <b-col
              class="col kanban-widget"
              v-for="(column, index) in project_details.columns"
              :key="index"
            >
              <b-card
                :title="column.title"
                tag="article"
                class="mb-2 widget-img kanban-widget text-center p-2"
                style="background-color: rgb(241, 241, 241);"
              >
                <span class="mb-2" style="display:block;">({{column.tasks.length}})</span>
                <b-img :src="getColumnIcon(column.icon)" />
                <draggable
                  class="list-group text-left mt-4"
                  :list="column.tasks"
                  style="cursor:grab;"
                  group="people"
                  @change="log"
                >
                  <b-card
                    :title="getTaskName(element.title)"
                    class="mb-2 text-left task"
                    :style="getTaskHeight(element)"
                    v-for="(element) in column.tasks"
                    :key="element.title"
                  >
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
                <hr />
                <i class="fa fa-plus"></i>
              </b-card>
            </b-col>
          </b-col>
        </b-row>
      </b-container>
    </PerfectScrollbar>
  </div>
</template>

<script>
import Navbar from "./Navbar";
import draggable from "vuedraggable";
import { PerfectScrollbar } from "vue2-perfect-scrollbar";

export default {
  components: {
    Navbar,
    draggable,
    PerfectScrollbar
  },
  watch: {
    project_details: {
      handler: (val) => {
        console.log(val);
      },
      deep: true
    }
  },
  data() {
    return {
      project_details: { title: "", description: "", columns: [] }
    };
  },
  methods: {
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
    scrollHandle(evt) {
      console.log(evt);
    },
    log: function(evt) {
      window.console.log(evt);
    }
  },
  created() {
    this.$http
      .get("/user/projects", {
        params: { project_id: "5ec650aa9e0c776338d13f0c" }
      })
      .then(response => {
        console.log(response.data);
        this.project_details = response.data.result;
      });
  }
};
</script>

<style scoped>
.background-template {
  background: linear-gradient(
    180deg,
    rgb(50, 43, 167) 0%,
    rgb(69, 69, 175) 53%,
    rgba(0, 212, 255, 1) 100%
  );
}
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
  color: #4a5568;
  color: rgba(74, 85, 104, var(--text-opacity));
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
</style>
<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css"/>