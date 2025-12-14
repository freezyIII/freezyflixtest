


  const snowContainer = document.createElement('div');
    snowContainer.id = 'snow-container';
    document.body.appendChild(snowContainer);

    function createSnowflake() {
        const snowflake = document.createElement("div");
        snowflake.classList.add("snowflake");
        snowflake.style.left = Math.random() * 100 + "vw";
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + "s";
        snowflake.style.opacity = Math.random();
        snowflake.style.fontSize = Math.random() * 12 + 10 + "px";
        snowflake.innerHTML = "❄";

        snowContainer.appendChild(snowflake);

        setTimeout(() => {
            snowflake.remove();
        }, 5000);
    }
    