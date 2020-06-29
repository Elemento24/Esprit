"use strict";


var activeVintalight = function activeVintalight(container) {
    
    container.addEventListener("click", function (e) {
 
        var element = e.target;

        if (element.tagName == "DIV") {
          
            var src = element.querySelector("img").getAttribute("src"),
                descrip = element.querySelector("img").getAttribute("alt"),
                blogLink = element.querySelector("span").innerText,
                vintalightOverlay = document.createElement("div");
            
                
            vintalightOverlay.classList.add("vintalight-overlay");
            
            
            vintalightOverlay.innerHTML = "\n                <figure class=\"vintalight__container active\">\n                    <div class=\"vintalight__photo\">\n                        <a href=\"" + blogLink + "\"><img src=\"" + src + "\" alt=\"" + descrip + "\" class=\"vintalight__img\"/></a>\n                    </div>\n                    <figcaption class=\"vintalight__caption\">\n                        <h3 class=\"vintalight__text\">" + descrip + "</h3>\n                    </figcaption>\n                    <button class=\"vintalight__button\" id=\"button-close\">\u2715</button>\n                </figure>\n            ";
           
            document.body.appendChild(vintalightOverlay);
            
            setTimeout(function () {
                vintalightOverlay.classList.add("active");
            }, 1);
            
            document.body.style.overflow = "hidden";
            
            document.getElementById("button-close").addEventListener("click", function () {
                vintalightOverlay.classList.remove("active");
                setTimeout(function () {
                    document.body.removeChild(vintalightOverlay);
                }, 500);
                document.body.style.overflow = "auto";
            });
            window.addEventListener("keyup", function (e) {
                if (e.key === "Escape") document.getElementById("button-close").click();
            });
        }
    });
};

window.addEventListener("load", activeVintalight(document.getElementById("vintalight")));