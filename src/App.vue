<template>
  <div id="app">
    <div v-if="isLoggedIn">
      <div style="display: flex; justify-content: flex-end;">
        <button type="button" @click="logoutUser">LOGOUT</button>
      </div>
    <the-header v-once />
    <new-task-form @addTask="addTask" />
    <label>Filter by Category:</label>
    <select name="priority-filter" id="priority-filter" v-model="selectedPriority">
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option 
      v-for="option in priorityOptions"
      :value="option.id"
      :key="option.id">{{option.name}}</option>
    </select>
    <div id="nav" class="tabs">
      <router-link to="/active">Active Tasks</router-link>
      <router-link to="/completed">Completed Tasks</router-link>
    </div>

    <transition-group name="tab" :duration="{ enter: 600, leave: 300 }" appear>
      <router-view
        :tasks="overdueTasks"
        :class="{ 'overdue': !!overdueTasks.length }"
        name="overdue"
        key="overdue"
        @updateTask="updateTask"
        @toggleDone="toggleDone"
        @deleteTask="deleteTask"
      />
      <router-view
        :tasks="upcomingTasks"
        name="upcoming"
        key="upcoming"
        @updateTask="updateTask"
        @toggleDone="toggleDone"
        @deleteTask="deleteTask"
      />

      <router-view
        :tasks="completedTasks"
        :class="{ 'completed': !!completedTasks.length }"
        name="completed"
        key="completed"
        @updateTask="updateTask"
        @toggleDone="toggleDone"
        @deleteTask="deleteTask"
      />
    </transition-group>
  </div>
  <login-form v-else @userDidAuthenticate="saveApiTokens" />
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import NewTaskForm from '@/components/NewTaskForm'
import TaskList from '@/components/TaskList'
import TheHeader from '@/components/TheHeader'
import LoginForm from '@/components/LoginForm'

export default {
  // Global Awareness
  name: 'app',

  // Template Dependencies
  components: { NewTaskForm, TaskList, TheHeader, LoginForm },

  // Local State
  data: () => ({
    newTask: {},
    tasks: [
      { id: 1, title: 'Learn Vue', dueAt: '2018-08-17', isComplete: false },
      // { id: 2, title: 'Learn ES2015', dueAt: '2018-05-07', isComplete: false },
      // { id: 3, title: 'Learn ES2018', dueAt: '2018-05-28', isComplete: false },
      // { id: 4, title: 'Learn ES2017', dueAt: '2018-05-21', isComplete: false },
      // { id: 5, title: 'Learn ES2016', dueAt: '2018-05-14', isComplete: false },
      // { id: 6, title: 'Learn Vue-Router', dueAt: '2018-06-15', isComplete: false },
      // { id: 7, title: 'Midterm Project 1', dueAt: '2018-05-28', isComplete: true },
      // { id: 8, title: 'Quiz - JS', dueAt: '2018-05-21', isComplete: true },
      // { id: 9, title: 'Quiz - Vue Basics', dueAt: '2018-06-12', isComplete: false },
      // { id: 10, title: 'Midterm Project 2', dueAt: '2018-05-28', isComplete: false }
    ],
    priority: '',
    category: '',
    api: {
      accessToken: '',
      expiresAt: ''
    },
    taskList: {},
    
    users: { // A dictionary object rather than an array
      1: { id: 1, name: 'Tom' },
      2: { id: 2, name: 'Dick' },
      3: { id: 3, name: 'Harry' },
      4: { id: 4, name: 'Joe' }
    }
  }),
  computed: {
    isLoggedIn () {
      return this.api.accessToken && moment(this.api.expiresAt).isAfter()
    },
    axiosOptions () {
      return {
        baseURL: 'https://vue-todos.robertmckenney.ca/api',
        headers: { 'Authorization': `Bearer ${this.api.accessToken}` }
      }
    },
    activeTasks () {
      return this.tasks.filter(task => !task.isComplete)
    },
    completedTasks () {
      return this.tasks.filter(task => task.isComplete)
    },
    overdueTasks () {
      return this.activeTasks.filter(
        task => new Date(task.dueAt) < Date.now() && !task.isComplete
      )
    },
    upcomingTasks () {
      return this.activeTasks.filter(task => new Date(task.dueAt) >= Date.now())
    },

    filteredPriorityTasks () {
      return (!this.selectedPriority)
      ? this.tasks
      : this.tasks.filter(task => task.priority.id === this.selectedPriority)
    }
  },
  
  // Reactive and lifcycle Events
  // watch: {
  //   tasks: {
  //     handler: function () { this.syncTasks() },
  //     deep: true
  //   }
  // },
  
  created () {
    this.resetForm()
    this.loadCachedData()
  },

  // Non-Reactive Properties
  methods: {
    resetForm () {
      this.newTask = {
        title: '',
        description: '',
        dueAt: moment().format(),
        priority: 2,
        category: null,
        isComplete: false
      }
    },
    loadCachedData () {
      let apiTokens = localStorage.getItem('todoApiTokens')
      if (apiTokens === undefined) return
      apiTokens = JSON.parse(apiTokens)
      this.loginUser(apiTokens)
    },

    loginUser (apiTokens) {
      this.api.accessToken = apiTokens.access_token
      this.api.expiresAt = apiTokens.expires_at
      this.saveApiTokens(apiTokens)
      this.refreshTasks()
    },

    // This method is called when the LoginForm emits the saveApiTokens event
    saveApiTokens (apiTokens) {
      this.api.accessToken = apiTokens.access_token
      this.api.expiresAt = apiTokens.expires_at
      localStorage.setItem('todoApiTokens', JSON.stringify(apiTokens))
      this.refreshTasks()
    },

    logoutUser () {
      // clear the local state variables
      this.api.accessToken = ''
      this.api.expiresAt = ''
      // clear the localStorage
      localStorage.removeItem('todoApiTokens')
    },
     refreshTasks () {
      axios.get('/tasks', this.axiosOptions)
        .then(({data: {data}}) => {
          this.taskList = Object.assign({}, ...data.map(t => ({ [t.id]: t })))
        })
        .catch(error => this.handleAPIErrors(error))
    },
    addTask (task) {
      axios.post('/tasks', task, this.axiosOptions)
        .then(({data: {data: t}}) => {
          this.$set(this.taskList, t.id, t)
          this.resetForm()
        })
        .catch(error => this.handleAPIErrors(error))
    },
   
    deleteTask (task) {
      // const index = this.tasks.findIndex(t => t.id === task.id)
      // this.tasks.splice(index, 1)
      axios.delete(`/todos/${task.id}`, this.axiosOptions)
        .then(response => {
          this.$delete(this.taskList, task.id)
        })
        .catch(error => this.handleAPIErrors(error))
    },

    toggleDone (task) {
      task.isComplete = !task.isComplete
    },

    updateTask (task) {
      axios.patch('/tasks', task, this.axiosOptions)
        .then(({data: {data: t}}) => {
          this.$set(this.taskList, t.id, t)
          this.resetForm()
        })
        .catch(error => this.handleAPIErrors(error))
    },
    fetchUsers () {
      axios
        .get(`${this.baseUrl}/users`)
        .then(response => {
          this.users = Object.assign({}, ...response.data.map(user => ({[user.id]: user})))
        })
        .catch(error => this.handleAPIErrors(error))
    },

    // Retrive a single object
    getUser (id) {
      axios
        .get(`${this.baseUrl}/users/${id}`)
        .then(response => console.log(response.data))
        .catch(error => this.handleAPIErrors(error))
    },

    // Create a new object
    createUser (newUser) {
      axios
        .post(`${this.baseUrl}/users`, newUser)
        // We can use object destructuring to get the data property
        .then(({ data }) => {
          // this.users.push(data)
          this.users[data.id] = data
          this.newUser = { name: '' }
        })
        .catch(error => this.handleAPIErrors(error))
    },

    // Change the properties of an object
    updateUser (user) {
      axios
        .patch(`${this.baseUrl}/users/${user.id}`, user)
        .then(response => {
        this.users[user.id] = response.data
        })
        .catch(error => this.handleAPIErrors(error))
    },

    // Remove an object
    destroyUser (user) {
      axios
        .delete(`${this.baseUrl}/users/${user.id}`)
        .then(response => {
          // const index = this.users.findIndex(user)
          // this.users.splice(index, 1)
          delete this.users[user.id]
        })
        .catch(error => this.handleAPIErrors(error))
    },

    // A common error handler function
    handleAPIErrors (error) {
      // We will make this more robust net week
      console.log(error.message)
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 1rem;
}

.task-list {
  margin: 1rem 0;
  &.completed {
    // border-top: 1px solid hsl(153, 47%, 49%);
    background: hsl(153, 30%, 98.5%);
    color: hsl(153, 16%, 40%);
  }
  &.overdue {
    border-bottom: 1px solid hsl(348, 83%, 47%);
    background: hsl(348, 50%, 98.5%);
    color: hsl(348, 20%, 40%);
  }
}

#priority-filter {
  background: hsl(0, 0%, 97%);
    border: 1px solid hsl(0, 0%, 93%);
    font-size: 1.1rem;
    padding: 0.4em;
    border-radius: 0.25rem;
    margin-left: 0.5em;
}

.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;

  a {
    border-bottom: 1px solid hsl(0, 0%, 88%);
    color: #2c3e50;
    flex: 1;
    font-weight: bold;
    letter-spacing: 0.5px;
    padding: 0.5rem 1rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: all 0.6s ease-in-out;

    &.router-link-exact-active {
      border-bottom-color: #406be0;
      color: #3564c9;
    }
  }
}

// Tab transition styles
.tab-enter {
  opacity: 0;
  transform: translateY(-200%);
}
.tab-leave-to {
  opacity: 0;
  transform: translateY(200%);
}
.tab-enter-active {
  transition: all 0.4s ease;
}
.tab-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}
</style>
