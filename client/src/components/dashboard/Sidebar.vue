<template>
  <div>
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
        <b-form-group label="Animations:">
          <b-form-radio-group
            v-model="customization.animations.selected"
            :options="customization.animations.options"
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
  </div>
</template>

<script>
export default {
  props: ["customization"],
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
    }
  }
};
</script>

<style>
</style>