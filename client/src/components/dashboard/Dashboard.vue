<template>
  <div class="background-template h-100">
    <Navbar />
    <div style="height: 40px; margin-bottom: 15px;">
      <h2 class="text-white ml-4 mt-2">Project: Test Project</h2>
    </div>

    <PerfectScrollbar class="scroll-area">
      <b-container style="max-width: none !important;">
        <b-row>
          <b-col class="d-flex">
            <b-col class="col kanban-widget" v-for="(column, index) in columns" :key="index">
              <b-card
                :title="column.name"
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
                    :title="getTaskName(element.name)"
                    class="mb-2 text-left task"
                    :style="getTaskHeight(element)"
                    v-for="(element) in column.tasks"
                    :key="element.name"
                  >
                    <p v-if="element.expireDate">
                      <i class="fa fa-clock" />
                      {{element.expireDate}}
                    </p>
                    <span :class="`badge badge-${element.labelType}`" v-if="element.labelType">
                      <i class="fas fa-bookmark" />
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
  data() {
    return {
      columns: [
        {
          name: "To-Do",
          icon: "todo",
          tasks: [
            {
              name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              expireDate: "May 20",
              label: "Feature Request",
              labelType: "primary"
            },
            {
              name: "Add discount code to checkout page",
              label: "Feature Request",
              labelType: "danger"
            },
            { name: "Provide documentation on integrations" },
            { name: "Design shopping cart dropdown" }
          ]
        },
        {
          name: "In Progress",
          icon: "inprogress",
          tasks: [
            {
              name: "Fix that bug",
              expireDate: "May 29",
              label: "Bug",
              labelType: "danger"
            }
          ]
        },
        {
          name: "Done",
          icon: "done",
          tasks: [
            {
              name: "Consectetur adipiscing elit.",
              expireDate: "May 22",
              label: "Design",
              labelType: "info"
            },
            {
              name: "Code to checkout page",
              label: "Fix",
              labelType: "warning"
            }
          ]
        }
      ]
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
        return "height: 105px";
      } else {
        return "height: 80px";
      }
    },
    scrollHandle(evt) {
      console.log(evt);
    },
    add: function() {
      this.list.push({ name: "Juan" });
    },
    replace: function() {
      this.list = [{ name: "Edgard" }];
    },
    clone: function(el) {
      return {
        name: el.name + " cloned"
      };
    },
    log: function(evt) {
      window.console.log(evt);
    }
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