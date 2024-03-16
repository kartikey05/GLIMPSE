const NewPostPage = Vue.component("new_post", {
    data: function () {
        return {
            // error: "",
            title: "",
            description: "",
            file: "",
            error_1: false,
            error_2: false,
            error_3: false
        }
    },

    template: `
    <div style="max-width: 400px; margin: 0 auto; padding-top: 50px;">
        <h2 style="text-align: center; margin-bottom: 4rem;">Create a post</h2>
        <form style="border: 2px solid #ccc; border-radius: 5%; background-color: #f2f2f2; padding: 20px;">
            <div style="margin-bottom: 1rem;">
                <label for="title" style="font-weight: bold;">Title:</label>
                <input v-model="title"  ref="title" v-bind:class="[error_1 ? 'username' : '', 'form-control']" type="text" id="username" placeholder="Enter title" style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 1rem;">
                <label for="description" style="font-weight: bold;">Description:</label>
                <textarea v-model="description" ref="description" v-bind:class="[error_2 ? 'password' : '', 'form-control']" type="text" id="password" placeholder="Enter description" style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;"></textarea>
            </div>
            <div style="margin-bottom: 1rem;">
                <label for="image" style="font-weight: bold;">Select Image:</label>
                <input @change="handleFileSelect( $event )" ref="image" v-bind:class="[error_3 ? 'password' : '', 'form-control']" type="file" accept=".jpg,.jpeg,.png" multiple="false" id="password" placeholder="Enter description" style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
            </div>
            <button @click="createPost()" type="submit" style="width: 100%; background-color: #007bff; color: white; padding: 14px 20px; margin-top: 20px; border: none; border-radius: 4px; cursor: pointer;">Create Post</button>
        </form>
        <p style="text-align: center; margin-top: 3rem; font-size: 1.2rem;">Cancel and go back to <router-link to="/#/" style="color: #007bff;">Feed</router-link></p>
    </div>

    `,
    methods: {
        handleFileSelect(e) {
            this.file = e.target.files[0];
        },
        createPost() {
            this.error = "";
            var url = `/api/post`;

            let formData = new FormData();

            formData.append('file', this.file);
            formData.append('title', this.title);
            formData.append('description', this.description);

            fetch(url, {
                method: 'POST',
                headers: {
                    'x-access-tokens': localStorage.getItem('auth_token')
                },
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        window.location = `/#/`
                    } else {
                        this.error = data["error_message"]
                        if (data["error_code"] == "BE101") {
                            this.error_3 = true
                            this.file = ""
                            this.$refs.image.focus();
                        } else if (data["error_code"] == "BE108") {
                            this.error_1 = true
                            this.title = ""
                            this.$refs.title.focus()
                        } else if (data["error_code"] == "BE109") {
                            this.error_3 = true
                            this.description = ""
                            this.$refs.description.focus();
                        }
                    }
                });
        },
    }
})

export default NewPostPage