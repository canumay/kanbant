<template>
  <div class="mb-3 mt-2">
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
          <span :class="`badge badge-${props.option.labelType} float-right`">{{props.option.label}}</span>
        </div>
      </template>
    </multiselect>
    <i
      class="fas fa-cog text-white float-right mr-3 mt-3"
      style="font-size: 25px;"
      v-b-toggle.sidebar-1
    ></i>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import eventBus from "../../eventBus";
export default {
  props: ["projects"],
  components: {
      Multiselect
  },
  methods: {
    projectSelected(selectedOption) {
      eventBus.$emit("load-project-with-id", selectedOption._id ); // load project
    }
  }
};
</script>

<style>
</style>