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
      class="ml-4 mt-2"
      placeholder=""
      style="width: auto; display: inline-block;"
      selectLabel
      :options="projects.options"
      :searchable="true"
      :allow-empty="false"
      deselect-label="Selected"
      :hide-selected="false"
      @select="projectSelected"
      v-if="!isEditing"
    >
      <template slot="option" slot-scope="props">
        <div class="option__desc">
          <i class="fas fa-tasks" style="margin-right: 10px;"></i>
          <span class="option__title">{{ props.option.title }}</span>
        </div>
      </template>
    </multiselect>
    <span
      class="badge badge-success mr-2"
      v-if="!isEditing"
      style="font-size: 14px; cursor:pointer;"
    >
      <i class="fas fa-plus p-1" @click="createProject"></i>
    </span>
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
    createProject() {
      eventBus.$emit("create-project");
    },
    updateProjectTitle() {
      this.$http
        .put("/user/projects", {
          project_id: this.projects.selected._id,
          title: this.projects.selected.title
        })
        .then(res => {
          if (res.data.status === true) {
            this.$swal({
              position: "bottom-end",
              icon: "success",
              toast: true,
              title: "Project title successfully updated",
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            this.$swal({
              position: "bottom-end",
              icon: "error",
              toast: true,
              title: "Error occurred updating project title",
              showConfirmButton: false,
              timer: 1500
            });
          }
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
      this.$swal({
        title: "Are you sure?",
        text: "Do you really want to delete the project?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(result => {
        if (result.value) {
          this.$http
            .delete("/user/projects", {
              params: { project_id: this.projects.selected._id }
            })
            .then(res => {
              if (res.data.status === true) {
                this.$swal({
                  position: "bottom-end",
                  icon: "success",
                  toast: true,
                  title: "Project successfully deleted",
                  showConfirmButton: false,
                  timer: 1500
                });
                eventBus.$emit("project-deleted");
              } else {
                this.$swal({
                  position: "bottom-end",
                  icon: "error",
                  toast: true,
                  title: "Error occurred deleting the project",
                  showConfirmButton: false,
                  timer: 1500
                });
              }
              eventBus.$emit("load-project");
            })
            .catch(err => {
              if (err.response.status === 401) {
                this.$router.push("/login");
              }
            });
        }
      });
    }
  }
};
</script>

<style>
</style>