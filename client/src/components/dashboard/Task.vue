<template>
  <div>
    <draggable
      class="list-group text-left mt-4"
      :list="tasks"
      style="cursor:move; min-height: 100px;"
      group="people"
      ghost-class="ghost"
      @change="changed(column_id, $event)"
      :animation="200"
    >
      <b-card
        class="mb-2 text-left task"
        :class="getTaskCustomization"
        :style="getTaskHeight(element)"
        v-for="(element) in tasks"
        @contextmenu.prevent.stop="e => {element['column_id'] = column_id; taskHandle($event, element)}"
        :key="element._id"
      >
        <h4 class="card-title">{{element.title}}</h4>
        <span
          style="position: absolute; top: 0px; cursor:pointer;"
          @click.prevent.stop="e => {element['column_id'] = column_id; taskHandle($event, element)}"
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
  </div>
</template>

<script>
import eventBus from "../../eventBus";

import draggable from "vuedraggable";
export default {
  props: ["tasks", "column_id", "customization"],
  components: {
    draggable,
  },
  computed: {
    getTaskCustomization() {
      if (this.customization.theme.selected === "Dark") {
        return "bg-dark text-white";
      }
      return "";
    },
  },
  methods: {
    getTaskHeight(element) {
      if (element.date || element.label) {
        return "height: 90px";
      } else {
        return "height: 80px";
      }
    },
    taskHandle(event, item) {
      eventBus.$emit("task-option-handled", { event, item });
    },

    changed: function (column_id, evt) {
      if (evt.added) {
        console.log(evt.added.element);
        let task_id = evt.added.element._id;
        this.$http
          .put("/user/tasks", { task_id, column: column_id })
          .then((res) => {
            if (res.data.status && res.data.status === true) {
              this.$swal({
                position: "bottom-end",
                icon: "success",
                toast: true,
                title: "Task successfully updated.",
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              this.$swal({
                position: "bottom-end",
                icon: "success",
                toast: true,
                title: res.data.message,
                showConfirmButton: false,
                timer: 1500,
              });
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
          });
      }
    },
  },
};
</script>