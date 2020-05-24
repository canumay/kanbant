<template>
  <!-- Column -->
  <b-card
    tag="article"
    class="mb-2 widget-img kanban-widget text-center p-2"
    :class="getColumnCustomization"
    :style="getColumnStyle"
  >
    <!-- Column Header -->
    <template>
      <!-- Column Title -->
      <template>
        <h4
          class="card-title"
          @dblclick="edit_component.id_for_title = column._id"
          v-show="edit_component.id_for_title !== column._id"
        >{{column.title}}</h4>
        <b-form-input
          type="text"
          @focusout="updateColumnTitle(column._id, column.title)"
          tabindex="0"
          v-if="edit_component.id_for_title === column._id"
          v-model="column.title"
          @keyup.enter="edit_component.id_for_title = null;"
          style="width: auto; margin: auto;"
        />
      </template>
      <!-- End Of Column Title -->

      <!-- Column Menu -->
      <template>
        <span
          style="position: absolute; top: 0px; right:10px; cursor:pointer;"
          @click.prevent.stop="columnHandle($event, column)"
        >
          <i class="fas fa-ellipsis-h"></i>
        </span>
      </template>
      <!-- End Of Column Menu -->

      <!-- Column Task Size -->
      <template>
        <span class="mb-2" style="display:block;">({{column.tasks.length}})</span>
      </template>
      <!-- End Of Column Task Size -->

      <!-- Column Icon -->
      <template v-if="!customization.icons.selected">
        <b-img
          :src="getColumnIcon(column.icon)"
          @dblclick="changeComponentIconStatus(column._id)"
          class="mb-3"
        />
        <div v-if="edit_component.id_for_icon === column._id">
          <i
            class="fas fa-arrow-circle-left"
            @click="updateColumnIcon('left', column.icon, column._id)"
            style="cursor: pointer; position: absolute;left: 5%; top:150px; font-size: 25px;"
          ></i>
          <i
            class="fas fa-arrow-circle-right"
            @click="updateColumnIcon('right',column.icon, column._id)"
            style="cursor: pointer; position: absolute;right: 5%; top:150px; font-size: 25px;"
          ></i>
        </div>
      </template>
      <!-- End of Column Icon -->
    </template>

    <!-- Column Body -->
    <template>
      <Task :tasks="column.tasks" :column_id="column._id" :customization="customization" />
    </template>
    <!-- End Of Column Body -->

    <!-- Column Footer -->
    <template>
      <hr :style="getHRStyle" />
      <transition name="slide-fade">
        <div class="form" v-if="new_task.column_id === column._id" style="font-size: smaller;">
          <b-form-group
            label="What's must be done?"
            class="text-left"
            :invalid-feedback="invalidTitleFeedback"
            :state="taskTitleChecker"
          >
            <b-form-input v-model="new_task.title" :state="taskTitleChecker" trim size="sm"></b-form-input>
          </b-form-group>
          <b-form-group label="Expiration Date (optional)" class="text-left">
            <b-form-datepicker v-model="new_task.expireAt" class="mb-2" size="sm"></b-form-datepicker>
          </b-form-group>
          <b-form-group label="Do you wanna label the task?" class="text-left">
            <b-form-radio-group
              v-model="new_task.isLabeled"
              :options="[{text: 'Yes', value:true}, {text:'No', value:false}]"
            ></b-form-radio-group>
          </b-form-group>
          <template v-if="new_task.isLabeled">
            <b-form-group
              label="Label"
              class="text-left"
              :invalid-feedback="invalidLabelFeedback"
              :state="taskLabelChecker"
            >
              <b-form-input v-model="new_task.label" :state="taskLabelChecker" trim size="sm"></b-form-input>
            </b-form-group>
            <b-form-group label="Label Type" class="text-left">
              <b-form-select
                v-model="new_task.labelType"
                :options="['danger', 'warning', 'primary', 'info', 'dark', 'success']"
                size="sm"
              ></b-form-select>
            </b-form-group>
          </template>
          <b-form-group>
            <b-button
              v-if="taskTitleChecker"
              class="float-left mt-3"
              type="submit"
              variant="success"
              style="width: 48%;"
              @click="createNewTask"
            >
              <i class="fas fa-check mr-2" />Save task
            </b-button>
            <b-button
              v-if="taskTitleChecker"
              class="float-right mt-3"
              type="reset"
              variant="danger"
              style="width: 48%;"
              @click="resetNewTask"
            >
              <i class="fas fa-times mr-2" />Cancel
            </b-button>
          </b-form-group>
        </div>
      </transition>
      <i
        class="fas fa-plus"
        @click="e => {resetNewTask(); new_task.column_id=column._id;}"
        v-show="new_task.column_id !== column._id"
        style="cursor:pointer;"
      ></i>
      <i
        class="fas fa-times"
        @click="resetNewTask"
        v-show="new_task.column_id === column._id && !taskTitleChecker"
        style="cursor:pointer;"
      ></i>
    </template>
    <!-- End Of Column Footer -->
  </b-card>
  <!-- End of Column -->
</template>

<script>
import eventBus from "../../eventBus";
import Task from "./Task";
export default {
  props: ["customization", "column"],
  components: {
    Task
  },
  data() {
    return {
      available_icons: [
        "todo",
        "inprogress",
        "done",
        "programming",
        "mobile-testing",
        "usability-testing",
        "mobile-messages",
        "review",
        "code-review",
        "survey",
        "report",
        "design-notes"
      ],
      edit_component: {
        id_for_title: "",
        id_for_icon: null
      },
      new_task: {
        title: "",
        label: "",
        labelType: null,
        expireAt: null,
        column_id: null,
        isLabeled: false
      }
    };
  },
  computed: {
    taskTitleChecker() {
      return this.new_task.title.length >= 3 ? true : false;
    },
    taskLabelChecker() {
      return this.new_task.label.length >= 3 ? true : false;
    },
    invalidTitleFeedback() {
      if (this.new_task.title.length > 3) {
        return "";
      } else if (this.new_task.title.length > 0) {
        return "Enter at least 3 characters";
      } else {
        return "Please enter something";
      }
    },
    invalidLabelFeedback() {
      if (this.new_task.label.length > 3) {
        return "";
      } else if (this.new_task.label.length > 0) {
        return "Enter at least 3 characters";
      } else {
        return "Please enter something";
      }
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
    createNewTask() {
      let {
        title,
        label,
        labelType,
        expireAt,
        column_id,
        isLabeled
      } = this.new_task;
      let data = { title, column_id };
      if (column_id !== null) {
        if (expireAt !== null) {
          expireAt = new Date(expireAt);
          data["expireAt"] = expireAt;
        }
        if (label !== null && isLabeled) {
          data["label"] = label;
          if (labelType !== null) {
            data["labelType"] = labelType;
          } else {
            data["labelType"] = "dark";
          }
        }
        this.$http
          .post("/user/tasks", data)
          .then(res => {
            if (res.data.status === true) {
              this.$swal({
                position: "bottom-end",
                icon: "success",
                toast: true,
                title: "Task successfully created",
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              this.$swal({
                position: "bottom-end",
                icon: "error",
                toast: true,
                title: "Error occurred creating the task",
                showConfirmButton: false,
                timer: 1500
              });
            }
            eventBus.$emit("load-project"); // load project again.
            this.resetNewTask();
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
          });
      } else {
        // warning...
      }
    },
    resetNewTask() {
      this.new_task = {
        title: "",
        label: "",
        labelType: null,
        expireAt: null,
        column_id: null,
        isLabeled: false
      };
    },
    columnHandle(event, item) {
      eventBus.$emit("column-option-handled", { event, item });
    },
    getColumnIcon(icon) {
      return require(`../../assets/svg/${icon}.svg`);
    },
    updateColumnTitle(column_id, title) {
      this.edit_component.id_for_title = null;
      this.$http
        .put("/user/columns", { column_id, title })
        .then(res => {
          if (res.data.status === true) {
            this.$swal({
              position: "bottom-end",
              icon: "success",
              toast: true,
              title: "Column title updated",
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            this.$swal({
              position: "bottom-end",
              icon: "error",
              toast: true,
              title: "Error occurred updating column title",
              showConfirmButton: false,
              timer: 1500
            });
          }
        })
        .catch(err => {
          if (err.response.status === 401) {
            this.$router.push("/login");
          }
        });
    },
    changeComponentIconStatus(column_id) {
      if (this.edit_component.id_for_icon === null) {
        this.edit_component.id_for_icon = column_id;
      } else {
        this.edit_component.id_for_icon = null;
      }
    },
    updateColumnIcon(cursor_direction, current_icon, column_id) {
      let index = this.available_icons.indexOf(current_icon);
      let icon = "";
      if (cursor_direction === "right") {
        if (index < this.available_icons.length - 1) {
          icon = this.available_icons[index + 1];
        } else {
          icon = this.available_icons[0];
        }
      } else {
        if (index === 0) {
          icon = this.available_icons[this.available_icons.length - 1];
        } else {
          icon = this.available_icons[index - 1];
        }
      }

      this.$http
        .put("/user/columns", { column_id, icon })
        .then(res => {
          if (res.data.status === true) {
            this.$swal({
              position: "bottom-end",
              icon: "success",
              toast: true,
              title: "Column icon successfully updated",
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            this.$swal({
              position: "bottom-end",
              icon: "error",
              toast: true,
              title: "Error occurred updating column icon",
              showConfirmButton: false,
              timer: 1500
            });
          }
          eventBus.$emit("load-project"); // load project again.
        })
        .catch(err => {
          if (err.response.status === 401) {
            this.$router.push("/login");
          }
        });
    }
  }
};
</script>