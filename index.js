const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const baseUrl = "https://freeapi.code4func.com/api/v1";

// Load data
fetch(`${baseUrl}/cate/list`)
  .then((response) => response.json())
  .then((result) => AddNav(result.data))
  .catch((error) => {
    console.error("Error:", error);
  });

fetch(`${baseUrl}/food/list/0/20`)
  .then((response) => response.json())
  .then((result) => AddProduct(result.data))
  .catch((error) => {
    console.error("Error:", error);
  });

// Search
var searchForm = document.getElementById("searchForm");
function handleSearchForm(event) {
  event.preventDefault();
  ReplaceProduct(null, document.getElementById("search").value);
}
searchForm.addEventListener("submit", handleSearchForm);

// Sign Up Form
var signUpForm = document.getElementById("signUpForm");
function handleSignUpForm(event) {
  event.preventDefault();
  let user = {
    fullName: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    password: document.getElementById("password").value,
    address: document.getElementById("address").value,
  };
  console.log(user);
  fetch(`${baseUrl}/user/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code != 200) {
        return alert(result.message);
      }
      console.error("Success:", result);
      let user = result.data;
      sessionStorage.setItem("name", user.fullName);
      sessionStorage.setItem("email", user.email);
      sessionStorage.setItem("phone", user.phone);
      sessionStorage.setItem("address", user.address);
      ChangeUserState(user.fullName);
      myHeaders.append("Authorization", "Bearer " + user.token);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
signUpForm.addEventListener("submit", handleSignUpForm);

// Sign In Form
var signInForm = document.getElementById("signInForm");
function handleSignInForm(event) {
  event.preventDefault();
  let user = {
    email: document.getElementById("signInEmail").value,
    password: document.getElementById("signInPassword").value,
  };
  console.log(user);
  fetch(`${baseUrl}/user/sign-in`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(user),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code != 200) {
        return alert(result.message);
      }
      console.error("Success:", result);
      let user = result.data;
      sessionStorage.setItem("name", user.fullName);
      sessionStorage.setItem("email", user.email);
      sessionStorage.setItem("phone", user.phone);
      sessionStorage.setItem("address", user.address);
      ChangeUserState(user.fullName);
      myHeaders.append("Authorization", "Bearer " + user.token);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
signInForm.addEventListener("submit", handleSignInForm);

function GetOrderId() {
  if (sessionStorage.getItem("order") != null) return;
  fetch(`${baseUrl}/order/count/shopping-cart`, {
    method: "GET",
    headers: myHeaders,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code != 200) {
        return alert(result.message);
      }
      console.error("Success:", result);
      sessionStorage.setItem("order", result.data.orderId);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function Add2Cart(foodid) {
  if (myHeaders.get("Authorization") == null) {
    return alert("Not sign in yet.");
  }
  let food = {
    foodId: foodid,
  };
  fetch(`${baseUrl}/order/add-to-cart`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(food),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code != 200) {
        return alert(result.message);
      }
      console.error("Success:", result);
      GetOrderId();
      UpdateShoppingCart();
      alert("Added to cart.");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

var currentUserState = "none";
function ChangeUserState(state) {
  let signUpForm = document.getElementById("signUpForm");
  signUpForm.style.display = "none";
  let signInForm = document.getElementById("signInForm");
  signInForm.style.display = "none";
  let cartScreen = document.getElementById("cartScreen");
  cartScreen.style.display = "none";
  if (state == currentUserState) return (currentUserState = "none");
  switch (state) {
    case "signUp":
      if (signUpForm.style.display == "none" && state != currentUserState)
        signUpForm.style.display = "flex";
      currentUserState = "signUp";
      break;
    case "signIn":
      if (signInForm.style.display == "none" && state != currentUserState)
        signInForm.style.display = "flex";
      currentUserState = "signIn";
      break;
    case "cartScreen":
      if (cartScreen.style.display == "none" && state != currentUserState) {
        UpdateShoppingCart();
        cartScreen.style.display = "flex";
      }
      currentUserState = "cartScreen";
      break;
    case "none":
      currentUserState = "none";
      break;
    default:
      let userGreeting = document.getElementById("userGreeting");
      RemoveChild("userGreeting");
      let h3 = document.createElement("h3");
      h3.className = "pointer";
      h3.setAttribute("onclick", "ChangeUserState('cartScreen');");
      h3.innerHTML = `Welcome ${sessionStorage.getItem("name")}`;
      userGreeting.appendChild(h3);
  }
}

function UpdateShoppingCart() {
  fetch(`${baseUrl}/order/shopping-cart`, {
    method: "GET",
    headers: myHeaders,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code != 200) {
        return alert(result.message);
      }
      console.error("Success:", result);
      RemoveChild("shoppingCart");
      if (result.message != null) {
        let li = document.createElement("li");
        li.innerHTML = result.message;
        document.getElementById("shoppingCart").appendChild(li);
        document.getElementById("totalPrice").innerHTML = 0;
        return;
      }
      let items = result.data.items;
      for (let item of items) {
        let li = document.createElement("li");
        li.className = "cartItem";

        let img = document.createElement("img");
        img.src = item.images[0].imageUrl;

        let cartItemInfo = document.createElement("cartItemInfo");
        cartItemInfo.className = "cartItemInfo";

        let cartItemName = document.createElement("span");
        cartItemName.id = "cartItemName";
        cartItemName.innerHTML = item.foodName;

        let cartItemPrice = document.createElement("span");
        cartItemPrice.id = "cartItemPrice";
        cartItemPrice.innerHTML = item.price;

        let cartItemQuantity = document.createElement("div");
        cartItemQuantity.className = "cartItemQuantity";

        let input = document.createElement("input");
        input.type = "number";
        input.name = item.foodId;
        input.className = "itemQuantity";
        input.value = item.quantity;

        let label = document.createElement("label");
        label.innerHTML = "Quantity:";
        label.for = "itemQuantity";

        cartItemQuantity.appendChild(label);
        cartItemQuantity.appendChild(input);
        cartItemInfo.appendChild(cartItemName);
        cartItemInfo.appendChild(cartItemPrice);
        cartItemInfo.appendChild(cartItemQuantity);
        li.appendChild(img);
        li.appendChild(cartItemInfo);

        document.getElementById("shoppingCart").appendChild(li);
      }
      document.getElementById("totalPrice").innerHTML = result.data.total;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function ChangeCartItemQuantity() {
  let items = document.getElementsByClassName("itemQuantity");
  for (let item of items) {
    if (item.value == 0) {
      let obj = {
        foodId: item.name,
      };
      fetch(`${baseUrl}/order/delete`, {
        method: "DELETE",
        headers: myHeaders,
        body: JSON.stringify(obj),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.code != 200) {
            return alert(result.message);
          }
          console.error("Success:", result);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      let obj = {
        orderId: sessionStorage.getItem("order"),
        foodId: item.name,
        quantity: parseInt(item.value),
      };
      console.log(obj);
      fetch(`${baseUrl}/order/update`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(obj),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.code != 200) {
            return alert(result.message);
          }
          console.error("Success:", result);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }
  ChangeUserState("none");
  ChangeUserState("cartScreen");
  alert("Done!");
}

function ConfirmOrder() {
  let order = {
    orderId: sessionStorage.getItem("order"),
    status: "CONFIRM",
  };
  fetch(`${baseUrl}/order/confirm`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(order),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code != 200) {
        return alert(result.message);
      }
      console.error("Success:", result);
      alert("Order Confirmed!");
      sessionStorage.setItem("order", null);
      ChangeUserState("none");
      ChangeUserState("cartScreen");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function ShowProduct(foodid) {
  fetch(`${baseUrl}/food/detail/${foodid}`)
    .then((response) => response.json())
    .then((result) => {
      if (result.code != 200) {
        return alert(result.message);
      }
      let product = result.data;
      document.getElementById("product-name").innerHTML = product.foodName;
      RemoveChild("product-images");
      let i = -1;
      console.log(product);
      while (product.images[++i] != null && i < 3) {
        let img = document.createElement("img");
        img.src = product.images[i].imageUrl;
        document.getElementById("product-images").appendChild(img);
      }
      document
        .getElementById("buy-button")
        .setAttribute("onclick", `Add2Cart('${product.foodId}')`);
      ChangePopupState("flex");
    });
}

function ChangePopupState(state) {
  document.getElementById("popup").style.display = state;
}

var currentExtendUrl = "/food/list/";
function ReplaceProduct(cateid, foodname) {
  RemoveChild("product-list");
  if (cateid != null) {
    fetch(`${baseUrl}/cate/food/${cateid}/0/20`)
      .then((response) => response.json())
      .then((result) => {
        AddProduct(result.data);
        currentExtendUrl = `/cate/food/${cateid}/`;
      });
    return;
  }
  if (foodname != null) {
    let obj = { foodName: foodname };
    fetch(`${baseUrl}/food/search`, {
      method: "POST",
      body: JSON.stringify(obj),
    })
      .then((response) => response.json())
      .then((result) => {
        AddProduct(result.data);
        currentExtendUrl = null;
      });
    return;
  }
  fetch(`${baseUrl}/food/list/0/20`)
    .then((response) => response.json())
    .then((result) => {
      AddProduct(result.data);
      currentExtendUrl = "/food/list/";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

var lastItem = 0;
function LoadMore() {
  if (currentExtendUrl == null) return alert("No more item to load");
  fetch(`${baseUrl}${currentExtendUrl}${lastItem}/20`)
    .then((response) => response.json())
    .then((result) => AddProduct(result.data));
}

function RemoveChild(parentId) {
  let parent = document.getElementById(parentId);
  while (parent.firstChild) {
    parent.firstChild.remove();
  }
}

function AddProduct(products) {
  if (products == null) {
    return (document.getElementById("product-list").innerHTML =
      "No products found");
  }
  for (let product of products) {
    let div = document.createElement("div");
    div.className = "content-item pointer";
    div.setAttribute("onclick", `ShowProduct("${product.foodId}")`);

    let divInfo = document.createElement("div");
    divInfo.className = "content-item-info";

    let img = document.createElement("img");
    img.className = "content-item-image";
    img.src = product.images[0].imageUrl;

    let spanName = document.createElement("span");
    spanName.className = "content-item-name";
    spanName.innerHTML = product.foodName;

    let spanPrice = document.createElement("span");
    spanPrice.className = "content-item-price";
    spanPrice.innerHTML = product.price + "đ";

    divInfo.appendChild(spanName);
    divInfo.appendChild(spanPrice);
    div.appendChild(img);
    div.appendChild(divInfo);

    let li = document.createElement("li");
    li.appendChild(div);
    document.getElementById("product-list").appendChild(li);

    currentLastItem = product.createdAt;
  }
  lastItem = products[products.length - 1].createdAt;
}

function AddNav(list) {
  for (let item of list) {
    let div = document.createElement("div");
    div.className = "nav-item poiner";
    div.setAttribute("onclick", `ReplaceProduct("${item.cateId}")`);
    div.innerHTML = item.cateName;

    let li = document.createElement("li");
    li.appendChild(div);
    document.getElementById("nav-list").appendChild(li);
  }
}
