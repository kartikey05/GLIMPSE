const EditPostPage = Vue.component("edit_post", {
    props: {
        postId: {
            type: String,
            required: true
        }
    },
    data: function () {
        return {
            title: "",
            description: "",
            file: "",
            previousImage: "",
            error_1: false,
            error_2: false,
            error_3: false
        }
    },

    template: `
    <div style="max-width: 400px; margin: 0 auto; padding-top: 50px;">
        <h2 style="text-align: center; margin-bottom: 4rem;">Update post</h2>
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
                <label for="image" style="font-weight: bold;">Select Image: (optional)</label>
                <input @change="handleFileSelect( $event )" ref="image" v-bind:class="[error_3 ? 'password' : '', 'form-control']" type="file" accept=".jpg,.jpeg,.png" multiple="false" id="password" placeholder="Enter description" style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
            </div>
            <h5>Previous Image:</h5>
            <img :src="imageSrc(previousImage)" v-if="previousImage" class="card-img-top" alt="image" style="object-fit: cover; width: 100px;">
            <button @click="updatePost()" type="submit" style="width: 100%; background-color: #007bff; color: white; padding: 14px 20px; margin-top: 20px; border: none; border-radius: 4px; cursor: pointer;">Update Post</button>
        </form>
        <p style="text-align: center; margin-top: 3rem; font-size: 1.2rem;">Cancel and go back to <router-link to="/" style="color: #007bff;">Feed</router-link></p>
    </div>

    `,
    mounted() {
        this.grabPostDetails();
    },
    methods: {
        handleFileSelect(e) {
            this.file = e.target.files[0];
        },
        grabPostDetails() {
            var url = `/api/post/${this.postId}`
            fetch(url, {
                headers: {
                    'x-access-tokens': localStorage.getItem('auth_token')
                },
            })
                .then(response => {
                    if (response.ok) {
                        response.json().then(data => {
                            console.log(data)
                            this.title = data["title"];
                            this.description = data["description"];
                            this.previousImage = data["image"];
                            
                        })
                    }
                });
        },
        imageSrc(base64String) {
            return `data:image/;base64,${base64String}`;
        },
        updatePost() {
            this.error = "";
            var url = `/api/post`;

            let formData = new FormData();

            formData.append('id', this.postId);
            formData.append('file', this.file);
            formData.append('title', this.title);
            formData.append('description', this.description);

            fetch(url, {
                method: 'PUT',
                headers: {
                    'x-access-tokens': localStorage.getItem('auth_token')
                },
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        window.location = '/#/';
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

export default EditPostPage