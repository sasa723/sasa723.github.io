document.addEventListener("DOMContentLoaded", () => {
    const popupButtons = document.querySelectorAll("[data-dialog]");
    const popupWindows = document.querySelectorAll(".faux-window");

    let highestZIndex = 100;

    function bringToFront(popup) {
        highestZIndex += 1;
        popup.style.zIndex = highestZIndex;
    }

    function positionNearButton(popup, button) {
        const buttonRect = button.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const gap = 5;
        const edgeSpace = 75;

        let left = buttonRect.right + gap;
        let top = buttonRect.top;

        if (left + popupRect.width > window.innerWidth - edgeSpace) {
            left = buttonRect.left - popupRect.width - gap;
        }

        //horizontal limit
        left = Math.max(
            edgeSpace,
            Math.min(
                left,
                window.innerWidth - popupRect.width - edgeSpace
            )
        );
        
        //vertical limit
        top = Math.max(
            edgeSpace,
            Math.min(
                top,
                window.innerHeight - popupRect.height - edgeSpace
            )
        );

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    }

    popupButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const dialogId = button.dataset.dialog;
            const popup = document.getElementById(dialogId);

            if (!popup) {
                console.error(`No dialog found with id "${dialogId}".`);
                return;
            }
            if (!popup.open) {
                popup.show();
            }

            positionNearButton(popup, button);
            bringToFront(popup);
        });
    });


    //closing & dragging
    popupWindows.forEach((popup) => {
        const titleBar = popup.querySelector(".window-bar");
        const closeButton = popup.querySelector(".close-dialog");

        //[x] button functionality
        closeButton.addEventListener("click", () => {
            popup.close();
        });


        //bring it forward if clicked
        popup.addEventListener("pointerdown", () => {
            bringToFront(popup);
        });


        let dragging = false;
        let pointerOffsetX = 0;
        let pointerOffsetY = 0;



        //drag using titlebar only
        titleBar.addEventListener("pointerdown", (event) => {
            if (event.target.closest(".close-dialog")) {
                return;
            }

            dragging = true;

            const popupRect = popup.getBoundingClientRect();

            pointerOffsetX = event.clientX - popupRect.left;
            pointerOffsetY = event.clientY - popupRect.top;

            titleBar.setPointerCapture(event.pointerId);
            bringToFront(popup);
        });
        titleBar.addEventListener("pointermove", (event) => {
            if (!dragging) {
                return;
            }

            const edgeSpace = 8;

            let newLeft = event.clientX - pointerOffsetX;
            let newTop = event.clientY - pointerOffsetY;

            const maximumLeft = Math.max(
                edgeSpace,
                window.innerWidth - popup.offsetWidth - edgeSpace
            );

            const maximumTop = Math.max(
                edgeSpace,
                window.innerHeight - popup.offsetHeight - edgeSpace
            );

            newLeft = Math.max(
                edgeSpace,
                Math.min(newLeft, maximumLeft)
            );

            newTop = Math.max(
                edgeSpace,
                Math.min(newTop, maximumTop)
            );

            popup.style.left = `${newLeft}px`;
            popup.style.top = `${newTop}px`;
        });


        titleBar.addEventListener("pointerup", (event) => {
            dragging = false;

            if (titleBar.hasPointerCapture(event.pointerId)) {
                titleBar.releasePointerCapture(event.pointerId);
            }
        });


        titleBar.addEventListener("pointercancel", () => {
            dragging = false;
        });
    });

    const soundButtons = document.querySelectorAll("[data-sound]");

    soundButtons.forEach((button) => {
        const sound = new Audio(button.dataset.sound);

        sound.preload = "auto";
        sound.volume = 1;
        button.addEventListener("click", () => {
            sound.currentTime = 0;

            sound.play().catch((error) => {
                console.error("The sound could not play:", error);
            });
        });
    });
});

