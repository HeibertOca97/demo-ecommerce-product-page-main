/***************************
 * 
 * 
 * 
    RESOURCE - FUNCTION PREPARED TO GET DATA FROM AN REST API..
 *
 *
 * 
    ***************************/
function getDataRestAPI() {
    return new Promise(function (resolve, reject) {
        const currentProduct = {
            id: 1,
            name: "Fall Limited Edition Sneakers",
            description: "These low-profile sneakers are your perfect casual wear companion. Featuring a durable rubber outer sole, they’ll withstand everything the weather can offer.",
            company: "SNEAKER COMPANY",
            images: {
                normal: ["./images/image-product-1.jpg", "./images/image-product-2.jpg", "./images/image-product-3.jpg", "./images/image-product-4.jpg"],
                thumbnail: ["./images/image-product-1-thumbnail.jpg", "./images/image-product-2-thumbnail.jpg", "./images/image-product-3-thumbnail.jpg", "./images/image-product-4-thumbnail.jpg"]
            },
            price: 250,
            offer: 50
        }
        if (currentProduct) {
            setTimeout(() => {
                resolve({
                    data: currentProduct,
                    status: 200,
                    statusText: "Ok"
                });
            }, 1000);
        } else {
            setTimeout(() => {
                reject({
                    statusText: "Resources not found",
                    status: 404
                });
            }, 1000);
        }
    });
}

/***************************
 * 
 * 
 * 
    GENERAL VARIABLES
 *
 *
 * 
    ***************************/
// HTML ELEMENT VARIABLES
let modalMenu = document.getElementById("modal-menu"),
    btnCart = document.getElementById("btn-cart"),
    modalCart = btnCart.parentElement.lastElementChild,
    btnAddCart = document.getElementById("btnAddCart"),
    imageHTML = document.getElementsByClassName("box-product"),
    qty_product = document.querySelector("input[name=quantity]");

// STATE VARIBLES
const productState = {
    qty: 0
}

const carouselState = {
    firstCurrentIndex: 0,
    secondCurrentIndex: 0,
};

const shoppingCart = [];

const windowAverageMeasure = 768;

/***************************
 * 
 * 
 * 
    HTML ELEMENT - ADD DATA
 *
 *
 * 
    ***************************/

// VALIDATION TO GET PRODUCT DATA
async function getProductData() {
    let message;
    try {
        let response = await getDataRestAPI();
        const { data } = response;

        if (response.status == 200) {
            return {
                data,
                status: response.status
            };
        }

        throw new Error(response);

    } catch (err) {
        if (err.status == 404) {
            message = {
                error: err,
                status: 404
            };
        } else {
            message = {
                error: err.stack,
                status: 400
            };
        }
        return message;
    }
}

// FUNCTION THAT DISPLAYS PRODUCT DATA IN YOUR HTML ELEMENT SECTION
async function loadProductDataAndHTMLElement() {
    const { data, status, error } = await getProductData();

    if (status == 404) {
        document.querySelector("body>section").innerHTML = error.status + " | " + error.statusText;
    }
    if (status == 400) {
        document.querySelector("body>section").innerHTML = error;
    }
    if (status == 200) {
        const { name, description, company, price, offer } = data;

        let offerPrice = ((price * offer) / 100);
        let containerParent = document.querySelector(".box-detail-product");
        let htmlContent = `
            <p class="text-1 text-style-1">${company}</p>
            <h3 class="text-title-1">${name}</h3>
            <p class="text-description-1">${description}</p>
            <div class="box-prices flex-horizontal">
                <p class="flex-left">
                    <strong class="text-price-offer">$${convertIntegerToDecimal(offerPrice, 2)}</strong> 
                    <strong class="text-alert-offer">${offer}%</strong>
                </p>
                <p class="text-price">$${convertIntegerToDecimal(price, 2)}</p>
            </div>
        `;

        containerParent.insertAdjacentHTML("afterbegin", htmlContent);
    }

}


/***************************
 * 
 * 
 * 
    SHOPPING CART FUNCTIONALITY
 *
 *
 * 
    ***************************/

// FUNCTIONALITY TO CHECK THE MODAL STATE
function actionModalShoppingCart() {
    if (!btnCart.getAttribute("data-state")) {
        btnCart.setAttribute("data-state", "false");
    }

    if (btnCart.getAttribute("data-state") === "false") {
        // CREATE PARENT ELEMENT MODAL
        document.body.insertAdjacentHTML("afterbegin", `<div class="modal-transparent" onclick="closeModalShoppingCart(this)"></div>`);

        btnCart.setAttribute("data-state", "true");
        modalCart.style.display = "block";
        btnCart.children[0].children[0].setAttribute("fill", "#1d2025");
    } else {
        btnCart.setAttribute("data-state", "false");
        modalCart.style.display = "none";
        btnCart.children[0].children[0].setAttribute("fill", "#69707D");
    }
}

// FUNCTIONALITY TO CLOSE MODAL
function closeModalShoppingCart(el) {
    btnCart.children[0].children[0].setAttribute("fill", "#69707D");
    btnCart.setAttribute("data-state", "false");
    modalCart.style.display = "none";
    document.body.removeChild(el);
}

// FUNCTIONALITY TO ADD QUANTITY OF THE PRODUCT TO THE CART 
async function addProductAtTheShoppingCart() {
    const { data } = await getProductData();
    const { thumbnail } = data.images;
    const { name, price, offer } = data;

    let inputQty = document.querySelector("input[name=quantity]"),
        inputQtyNumber = Number(parseInt(inputQty.value));

    if (inputQtyNumber > 0 && typeof inputQtyNumber === "number") {
        let offerPrice = (price * offer) / 100,
            total = offerPrice * inputQtyNumber;

        const productData = {
            image: thumbnail[0],
            name,
            qty: inputQtyNumber,
            price: convertIntegerToDecimal(offerPrice, 2),
            total: convertIntegerToDecimal(total)
        }

        if (shoppingCart.length > 0) {
            // CHECK IF THIS PRODUCT EXISTS IN THE CART
            let getProductDataObject = shoppingCart.filter(res => res.name === name ? res : {});
            // CHECK AND GET INDEX
            let getIndex = shoppingCart.indexOf(getProductDataObject);

            // IF IT EXISTS PROCEED TO UPDATE
            if (getProductDataObject) {
                //DELETE OLD DATA
                shoppingCart.splice(getIndex, 1);

                // ADD NEW DATA - "UPDATE"
                shoppingCart.push(productData);
            } else {
                //IF IT DOES NOT EXIST ADD PRODUCT
                shoppingCart.push(productData);
            }

            addAndUpdateProductAtTheShoppingCart();
            return;
        }
        //ADD PRODUCT IF IT DOES NOT EXIST IN THE CART
        shoppingCart.push(productData);

        addAndUpdateProductAtTheShoppingCart();
    }
}

// FUNCTIONALITY TO UPDATE PRODUCTS ADDED TO THE CART
function addAndUpdateProductAtTheShoppingCart() {
    let boxQuantity = document.getElementById("box-cart-alert"),
        boxCart = document.getElementById("box-cart");

    const cardEmpty = `
            <article class="card-item-empty m-card">
                <p>Your cart is empty.</p>
            </article>
        `;
    let totalProduct = shoppingCart.map(data => data.qty).reduce((acc, el) => acc + el, 0);
    if (totalProduct > 0) {
        boxQuantity.style.display = "block";
        boxQuantity.innerHTML = totalProduct;
        var cardItem = ``;
        shoppingCart.forEach(item => {
            cardItem += `
            <article class="card-item m-card">
                <div class="item-detail">
                    <img class="item-avatar" src="${item.image}" alt="shoes-1">
                    <div class="item-description">
                        <p class="cl-gray">${getDataLength(item.name, 0, 20)}</p>
                        <span class="cl-gray">$${item.price} x ${item.qty}</span> &nbsp;<strong>$${item.total}</strong>
                    </div>
                    <img onclick="deleteItem('${item.name}')" class="item-action" src="./images/icon-delete.svg" alt="delete">
                </div>
                <button class="btn-checkout">Checkout</button>
            </article>
        `;
        });
        boxCart.innerHTML = cardItem;
    } else {
        boxQuantity.style.display = "none";
        boxQuantity.innerHTML = 0;
        boxCart.innerHTML = cardEmpty;
    }
}

// FUNCIONALITY TO REMOVE THE PRODUCT FROM THE CART
function deleteItem(nameOrID) {
    // CHECK IF THIS PRODUCT EXISTS IN THE CART
    let getProductDataObject = shoppingCart.filter(res => res.name === nameOrID ? res : {});
    // CHECK AND GET INDEX
    let getIndex = shoppingCart.indexOf(getProductDataObject);

    if (getProductDataObject) {
        //DELETE OLD DATA
        shoppingCart.splice(getIndex, 1);
    }

    addAndUpdateProductAtTheShoppingCart();
}

btnCart.addEventListener("click", actionModalShoppingCart);
btnAddCart.addEventListener("click", addProductAtTheShoppingCart);


/***************************
 * 
 * 
 * 
    NAVIGATION MENU FUNCTIONALITY
 *
 *
 * 
    ***************************/

// FUNCTIONALITY TO OPEN MODAL
function handleToOpenModalMenu() {
    modalMenu.style.left = "0%";
    document.body.style.overflow = "hidden";
    setTimeout(() => modalMenu.style.opacity = 1, 100);
}

// FUNCTIONALITY TO CLOSE MODAL
function handleToCloseModalMenu() {
    modalMenu.style.opacity = 0;
    modalMenu.style.left = "-100%";
    document.body.style.overflow = "auto";
}

modalMenu.addEventListener("click", e => e.target.matches("#modal-menu") ? handleToCloseModalMenu() : '');

// FUNCTIONALITY TO CHANGE CSS STYLE
function loadModalOptionMenu() {
    if (window.innerWidth < 768) {
        modalMenu.classList.replace("box-link-desktop", "box-link-mobile");
        modalMenu.children[0].classList.replace("nav-desktop", "nav-mobile");
    } else {
        modalMenu.classList.replace("box-link-mobile", "box-link-desktop");
        modalMenu.children[0].classList.replace("nav-mobile", "nav-desktop");
        modalMenu.removeAttribute("style");
    }
}

/***************************
 * 
 * 
 * 
    PRODUCT DATA FUNCTIONALITY - IMAGE COROUSEL - PRODUCT QUANTITY COUNTER
 *
 *
 * 
    ***************************/

// FUNCTION TO GO TO THE PREVIOUS IMAGE
async function toPreviousImage() {
    const { data } = await getProductData();
    const { normal } = data.images;

    let btnControlImageAll = document.querySelectorAll(".btn-control-image");
    let averageAmountOfItem = Math.ceil((btnControlImageAll.length - 1) / 2);

    if (carouselState.firstCurrentIndex > 0) {
        carouselState.firstCurrentIndex--;
    } else {
        carouselState.firstCurrentIndex = normal.length - 1;
    }

    getImageAndUpdateViewer({
        urlImage: normal[carouselState.firstCurrentIndex],
        imageTime: 50,
        imageOpacityTime: 100
    });

    if (carouselState.secondCurrentIndex == 0) {
        carouselState.secondCurrentIndex = averageAmountOfItem;
    }

    if (carouselState.secondCurrentIndex > averageAmountOfItem) {
        carouselState.secondCurrentIndex--;
    } else {
        carouselState.secondCurrentIndex = btnControlImageAll.length - 1;
    }

    if (document.querySelector(".box-control-image")) {
        selectThisImageToView({
            currentElement: btnControlImageAll[carouselState.firstCurrentIndex],
            allElement: btnControlImageAll,
            averageAmountOfItem
        });
    }
}

// FUNCTION TO GO TO THE NEXT IMAGE
async function toNextImage() {
    const { data } = await getProductData();
    const { normal } = data.images;

    let btnControlImageAll = document.querySelectorAll(".btn-control-image");
    let averageAmountOfItem = Math.ceil((btnControlImageAll.length - 1) / 2);

    if (carouselState.firstCurrentIndex < normal.length - 1) {
        carouselState.firstCurrentIndex++;
    } else {
        carouselState.firstCurrentIndex = 0;
    }

    getImageAndUpdateViewer({
        urlImage: normal[carouselState.firstCurrentIndex],
        imageTime: 50,
        imageOpacityTime: 100
    });

    if (carouselState.secondCurrentIndex == 0) {
        carouselState.secondCurrentIndex = averageAmountOfItem;
    }

    if (carouselState.secondCurrentIndex < (btnControlImageAll.length - 1)) {
        carouselState.secondCurrentIndex++;
    } else {
        carouselState.secondCurrentIndex = averageAmountOfItem;
    }

    if (document.querySelector(".box-control-image")) {
        selectThisImageToView({
            currentElement: btnControlImageAll[carouselState.firstCurrentIndex],
            allElement: btnControlImageAll,
            averageAmountOfItem
        });
    }

}
// FUNCTION THAT CHANGES THE DISPLAYED IMAGE
function getImageAndUpdateViewer(dataObject) {
    const { urlImage, imageTime, imageOpacityTime } = dataObject;

    for (let i = 0; i < imageHTML.length; i++) {
        imageHTML[i].children[0].style.opacity = 0;
        setTimeout(() => imageHTML[i].children[0].setAttribute("src", urlImage), imageTime);
        setTimeout(() => imageHTML[i].children[0].style.opacity = 1, imageOpacityTime);
    };
}

// FUNCTION THAT RETURNS THE HTML STRUCTURE OF THE BUTTON SECTION OF THE VIEWER
async function CarouselImageComponent() {
    let bodyHTML = ``;
    try {
        const { data } = await getProductData();
        const { thumbnail } = data.images;

        bodyHTML += `<picture class="box-control-image">`;
        thumbnail.forEach((item, index) => {
            bodyHTML += `
                <div class="btn-control-image" onclick="markedAndSelectedThisImageToView(this)">
                    <img class="control-image" src="${item}" alt="Shoes-${index + 1}" loading="lazy">
                </div>
            `;
        });

    } catch (error) {
        bodyHTML += `
            <div class="btn-control-image">
                <img class="control-image" src="Filename 'product.json' not founded" alt="Filename 'product.json' not founded">
            </div>
        `
    } finally {
        bodyHTML += `</picture>`;
        return bodyHTML;
    }

}

// FUNCTION THAT ADDS THE IMAGES BUTTONS SECTION TO DISPLAY
async function addOptionImageBotton() {

    if (!document.querySelector(".box-control-image")) {
        //if exist Add element
        if (document.getElementById("box-image-visor").children.length < 2) {
            document.getElementById("box-image-visor").insertAdjacentHTML("beforeend", await CarouselImageComponent());
        }
        //if Add and repeat more element two remove others
        if (document.getElementById("box-image-visor").children.length > 2) {
            document.getElementById("box-image-visor").removeChild(document.querySelector(".box-control-image"));
        }

        //if exist Add style children element
        let btnControlImageAll = document.querySelectorAll(".btn-control-image");
        btnControlImageAll[carouselState.firstCurrentIndex].classList.add("check-img");
    }

}

// FUNCTION THAT REMOVE THE IMAGES BUTTONS SECTION TO DISPLAY
function removeOptionImageBotton() {
    if (document.querySelector(".box-control-image")) {
        document.getElementById("box-image-visor").removeChild(document.querySelector(".box-control-image"));
    }
}

// FUNCTION THAT MARKS THE BUTTON "IMAGE" FROM BUTTON SECTION AND CHANGES THE IMAGE OF THE VIEWER
function markedAndSelectedThisImageToView(el) {
    let btnControlImageAll = document.querySelectorAll(".btn-control-image");
    let averageAmountOfItem = Math.ceil((btnControlImageAll.length - 1) / 2);

    el.classList.add("check-img");

    for (let index = 0; index < btnControlImageAll.length; index++) {
        if (el !== btnControlImageAll[index]) {
            btnControlImageAll[index].classList.remove("check-img");
        } else {
            carouselState.firstCurrentIndex = index;
            carouselState.secondCurrentIndex = averageAmountOfItem + index;
        }
    }

    if (document.querySelector("#modal-carousel-image")) {
        if (btnControlImageAll[carouselState.secondCurrentIndex]) {
            btnControlImageAll[carouselState.secondCurrentIndex].classList.add("check-img");
        }
    }
    let extUrlNormalImage = el.children[0].src.replace(/\-thumbnail/i, "");

    if (extUrlNormalImage !== imageHTML[0].children[0].src) {
        getImageAndUpdateViewer({
            urlImage: extUrlNormalImage,
            imageTime: 100,
            imageOpacityTime: 150
        });
    }
}

// FUNCTION THAT MARKS THE BUTTON "IMAGE" FROM BUTTON SECTION
function selectThisImageToView(dataObject) {
    const { currentElement, allElement, averageAmountOfItem } = dataObject;

    currentElement.classList.add("check-img");

    for (let index = 0; index < allElement.length; index++) {
        if (currentElement !== allElement[index]) {
            allElement[index].classList.remove("check-img");
        }
        else {
            carouselState.firstCurrentIndex = index;
        }
    }
    carouselState.secondCurrentIndex = averageAmountOfItem + carouselState.firstCurrentIndex;

    if (document.querySelector("#modal-carousel-image")) {
        allElement[carouselState.secondCurrentIndex].classList.add("check-img");
    }
}

// FUNCTION THAT CREATE AND OPEN THE MODAL PRODUCT VIEWER 
function loadAndDisplayTheProductModal() {
    document.getElementById("box-view").addEventListener("click", () => {
        if (window.innerWidth > 768) {
            document.body.style.overflow = "hidden";

            if (!document.querySelector("#modal-carousel-image")) {
                // CREATE PARENT ELEMENT MODAL
                document.body.insertAdjacentHTML("afterbegin", `<div id="modal-carousel-image" class="modal-carousel-image">
                    <div class="card-modalProductImage"></div>
                </div>`);

            }

            let parentVisor = document.getElementById("box-image-visor");
            let modalCarousel = document.getElementById("modal-carousel-image");

            modalCarousel.children[0].innerHTML = parentVisor.innerHTML;

            modalCarousel.children[0].insertAdjacentHTML("afterbegin", `<span id="btn-close-modal" class="btn-close-modal" onclick="closeModalProduct()">
                <svg width="21" height="22" viewBox="-1 -1 16 15" xmlns="http://www.w3.org/2000/svg"><path d="m11.596.782 2.122 2.122L9.12 7.499l4.597 4.597-2.122 2.122L7 9.62l-4.595 4.597-2.122-2.122L4.878 7.5.282 2.904 2.404.782l4.595 4.596L11.596.782Z" fill="#FFF" fill-rule="evenodd"/></svg>
            </span>`);

            document.querySelector("#modal-carousel-image").style.display = "flex";
        }

    });
}

// FUNCTION THAT CLOSE THE MODAL PRODUCT VIEWER 
function closeModalProduct() {
    document.querySelector("#modal-carousel-image").style.display = "none";
    document.body.style.overflow = "auto";
}

// FUNCTIONALITY - PRODUCT QUANTITY COUNTER
function toIncrementQuantityProduct() {
    productState.qty++;
    qty_product.value = productState.qty;
}

function toDecrementQuantityProduct() {
    if (qty_product.value > 0) {
        productState.qty--;
        qty_product.value = productState.qty;
    }
}


/***************************
 * 
 * 
 * 
    HELP FUNCTIONS
 *
 *
 * 
    ***************************/

// FUNCTIONALIDAD TO GET A NEW NUMERICAL QUANTITY IN DECIMALS
function convertIntegerToDecimal(values, decimal = 2) {
    let getValue, getDecimal;
    let valueArray = [],
        decimalArray = [],
        valuesReverse = (values + "").split("").reverse().join().split(",");

    for (let i = 0; i <= decimal; i++) {
        if (i > 0) {
            decimalArray.push("0")
        } else {
            decimalArray.push(".");
        }
    }

    for (let index = 0; index < valuesReverse.length; index++) {
        if (index > 0 && index % 3 == 0) {
            if (index != 6) {
                valueArray.push(".");
            }

            if (index == 6) {
                valueArray.push("'");
            }
        }

        valueArray.push(valuesReverse[index])
    }

    getValue = valueArray.reverse().join().replace(/\,/g, "")
    getValue = getValue.replace(/\./g, ",");
    getDecimal = decimalArray.join().replace(/\,/g, "");

    return getValue + getDecimal;
}

// FUNCTIONALITY TO CUT THE LENGTH OF A CHARACTER STRING
function getDataLength(data, min, max) {
    return window.innerWidth < windowAverageMeasure ? data.slice(min, max).concat('...') : data;
}

/***************************
 * 
 * 
 * 
    GENERAL FUNCTION LOADING - EVENT LISTENER "WINDOW" AND "DOCUMENT"
 *
 *
 * 
    ***************************/

window.addEventListener("resize", (e) => {
    loadModalOptionMenu();
    addAndUpdateProductAtTheShoppingCart();

    if (e.target.innerWidth < windowAverageMeasure) {
        if (document.querySelector("#modal-carousel-image")) {
            document.body.removeChild(document.querySelector("#modal-carousel-image"));
            document.body.style.overflow = "auto";
        }
        // removeOptionImageBotton();
    } else {
    }
    // addOptionImageBotton();
});

document.addEventListener("DOMContentLoaded", async () => {
    loadModalOptionMenu();
    loadProductDataAndHTMLElement();
    loadAndDisplayTheProductModal();
    addAndUpdateProductAtTheShoppingCart();

    if (window.innerWidth < windowAverageMeasure) {
        // removeOptionImageBotton();
    } else {
    }
    addOptionImageBotton();
});