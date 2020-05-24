<template>
  <div>
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
  </div>
</template>

<script>
import eventBus from "../../eventBus";
export default {
  props: ["tasks", "column_id", "customization"],
  computed: {
    getTaskCustomization() {
      if (this.customization.theme.selected === "Dark") {
        return "bg-dark text-white";
      }
      return "";
    }
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
    }
  }
};
</script>