<template>
  <div class="mb-3 mt-2">
    <template v-if="isEditing">
      <b-form-input
        type="text"
        @focusout="updateProjectTitle()"
        tabindex="0"
        class="ml-4 mt-2 mr-2"
        v-model="projects.selected.title"
        @keyup.enter="updateProjectTitle()"
        style="width: auto; display:inline-block;"
      />
    </template>

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
      v-if="!isEditing"
    >
      <template slot="option" slot-scope="props">
        <div class="option__desc">
          <i class="fas fa-tasks" style="margin-right: 10px;"></i>
          <span class="option__title">{{ props.option.title }}</span>
          <span :class="`badge badge-${props.option.labelType} float-right`">{{props.option.label}}</span>
        </div>
      </template>
    </multiselect>
    <span class="badge badge-dark mr-2" v-if="!isEditing" style="font-size: 14px; cursor:pointer;">
      <i class="fas fa-pen p-1" @click="isEditing = true"></i>
    </span>
    <span class="badge badge-danger" style="font-size: 14px; cursor:pointer;">
      <i class="fas fa-trash p-1" @click="deleteProject"></i>
    </span>
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
  data() {
    return {
      isEditing: false
    };
  },
  components: {
    Multiselect
  },
  methods: {
    projectSelected(selectedOption) {
      eventBus.$emit("load-project-with-id", selectedOption._id); // load project
    },
    updateProjectTitle() {
      this.$http
        .put("/user/projects", {
          project_id: this.projects.selected._id,
          title: this.projects.selected.title
        })
        .then(res => {
          console.log(res.data);
          eventBus.$emit("load-project-with-id", this.projects.selected._id); // load project
          this.isEditing = false;
        })
        .catch(err => {
          if (err.response.status === 401) {
            this.$router.push("/login");
          }
        });
    },
    deleteProject() {
      this.$http
        .delete("/user/projects", {
          params: { project_id: this.projects.selected._id }
        })
        .then(res => {
          console.log(res.data);
          eventBus.$emit("load-project"); // loads random projecs
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

<style>
</style>