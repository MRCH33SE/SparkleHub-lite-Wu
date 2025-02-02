document.addEventListener('DOMContentLoaded', (event) => {
  window.app = new Vue({
    el: '#app',
    data: {
      intervalId: null,
      isSending: false,
      errorMessage: "",
      sparkle: "",
      sparkles: [],
      searchTerm: ""
    },
    created: function() {
      this.reload();
      this.intervalId = setInterval(() => this.reload(), 30000);
    },
    destroyed: function() {
      if (this.intervalId)
        clearInterval(this.intervalId);
      this.intervalId = null;
    },
    computed: {
      heading: function() {
        return this.sparkles.length == 0 ? "No Sparkles Sent" : "Recent Sparkles";
      },
      recentSparkles: function() {
        return this.sparkles.reverse();
      },
      isDisabled: function() {
        return this.isSending || !this.isValid();
      },
      filteredSparkles: function() {
        if (this.searchTerm === ""){
          return this.sparkles.reverse();
        }
        return this.recentSparkles.filter((sparkle) => {
          return sparkle.sparklee.includes(this.searchTerm)
            || sparkle.reason.includes(this.searchTerm);
        });
      }
    },
    watch: {
      sparkle: function() {
        this.errorMessage = "";
      },
    },
    methods: {
      reload: function() {
        fetch("/v2/sparkles")
          .then((response) => response.json())
          .then((json) => this.sparkles = json.data.map(x => x.attributes))
          .catch((json) => console.error(json.errors));
      },
      isValid: function() {
        return this.sparkle.length > 0;
      },
      startConfetti: function() {
        let message = document.querySelector('#sparkle-sent-message');
        message.classList.remove("hidden");
        message.start();

        let container = document.querySelector('.confetti-container');

        for(let index = 255; index >= 0; index--) {
          let div = document.createElement("div");
          div.classList.add("confetti-" + index.toString())
          container.appendChild(div);
        }

        setTimeout(() => this.removeConfetti(), 12000);
      },
      removeConfetti: function() {
        let element = document.querySelector('.confetti-container')
        let message = document.querySelector('#sparkle-sent-message');
        message.classList.add("hidden");

        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
      },
      submitSparkle: function() {
        this.isSending = true;
        fetch("/sparkles.json", {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: { "Content-Type": "application/json" },
          redirect: "follow",
          body: JSON.stringify({ body: this.sparkle })
        }).then((response) => {
          response.json().then((json) => {
            this.isSending = false;
            if (response.ok) {
              this.startConfetti();
              this.sparkles.push(json);
              this.sparkle = "";
            } else {
              this.errorMessage = json["error"];
            }
          })
        }).catch((error) => console.error(error));
      }
    }
  })
});
