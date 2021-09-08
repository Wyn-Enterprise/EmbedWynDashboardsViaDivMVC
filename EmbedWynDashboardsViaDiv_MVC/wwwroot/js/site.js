var docDictionary = [],
    selectedDocument = null,
    viewer = null,
    designer = null,
    categories = [],
    selectedCat = null;

window.onload = () => {

    if (token == null) {
        window.location = "/Home/Index";
    }

    var backBtn = document.querySelector("#btnBack");
    backBtn.onclick = backBtn_click;

    var showCode = document.querySelector("#btnShowCode");
    showCode.onclick = showCodePanel_click;

    var btnCopyCode = document.querySelector("#btnCopyCode");
    btnCopyCode.onclick = btnCopyCode_click;

    var categoryList = document.getElementById("categoryList");
    categoryList.onclick = categorylist_click;

    loadCategories();
    loadDashboardList();
};

function loadCode(mode) {
    var codeStr = "";

    switch (mode) {
        case "Gallery":
            codeStr = `
 query {
    documenttypes(key: "dbd") {
        documents(orderby: "-created") {
           id,
           description,
           type,
           title,
           tags {id, name},
           created_by { name },
           created,
           modified_by { name },
           modified
        }
    }
 }`;
            break;

        case "Viewer":
            codeStr = `
 const viewer = WynDashboards.create('DashboardViewer', {
    dashboardId: '`+ selectedDocument.id + `',
    edition: 'EN',
    size: "fitToScreen",
    actions: "clearselection,annotation,analysispath",
    openfulldashboardmode: "newwindow",
    containerFilterScope: '',
    version: '1.0.0',
    userId: '`+ username + `',
    lng: 'en',
    baseUrl: '`+ wynUrl + `',
    token: token,
 });

 viewer.initialize({
    container: document.querySelector('#viewer'),
    onClose: () => {
       //console.log('close');
    },
    onLoaded: (docName) => {
       //console.log('loaded');
    },
 });`.trim();
            break;

        case "Designer":
            codeStr = `
 const designer = WynDashboards.create('DashboardDesigner', {
    edition: 'EN',
    dashboardId: '`+ selectedDocument.id + `',
    enableDeveloperMode: true,
    containerFilterScope: '',
    version: '1.0.0',
    userId: '`+ username + `',
    lng: 'en',
    baseUrl: '`+ wynUrl + `',
    token: token
 });

 designer.initialize({
    container: document.querySelector('#designer'),
    onClose: () => {
        //console.log('close');
    },
    onSave: (docName) => {
       //console.log('save');
    },
    onLoaded: (docName) => {
        //console.log('loaded');
    },
 });`.trim();
            break;

        case "NewDesigner":
            codeStr = `
 const designer = WynDashboards.create('DashboardDesigner', {
    edition: 'EN',    
    enableDeveloperMode: true,
    containerFilterScope: '',
    version: '1.0.0',
    userId: '`+ username + `',
    lng: 'en',
    baseUrl: '`+ wynUrl + `',
    token: token
 });

 designer.initialize({
    container: document.querySelector('#designer'),
    onClose: () => {
        //console.log('close');
    },
    onSave: (docName) => {
       //console.log('save');
    },
    onLoaded: (docName) => {
        //console.log('loaded');
    },
 });`.trim();
            break;
    }
    document.querySelector("#codeElement").textContent = codeStr;

    hljs.initHighlightingOnLoad();
}

function loadCategories() {
    var categoryList = document.getElementById("categoryList");

    categories.push({ icon: "mdi mdi-folder-open-outline", name: "Uncategorized" });

    var cats = getCategoriesList();
    cats.then(function (results) {

        results.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        });

        for (var i = 0; i < results.length; i++) {
            var category = results[i];

            if (!category.name.startsWith("$")) {
                if (categories.filter(x => x.name == category.name).length == 0) {
                    if (category.name == "Favorites")
                        category.iconCssClass = "mdi mdi-star";
                    categories.push({ icon: category.iconCssClass, name: category.name });
                }
            }
        }

        for (var c = 0; c < categories.length; c++) {
            var li = document.createElement('li');
            li.setAttribute("class", "list-group-item listItem");
            var icon = document.createElement("i");
            icon.className = categories[c].icon;
            li.appendChild(icon);
            li.appendChild(document.createTextNode(" " + categories[c].name));
            if (categories[c].name == "Uncategorized") {
                li.classList.add("selected");
            }
            categoryList.appendChild(li);
        }
    });
}

//Load Wyn Portal Page
function loadDashboardList() {
    var dashboards = getDashboardsList();
    dashboards.then(function (results) {
        docDictionary = results;
        showDashboards("Uncategorized");
    });
    loadCode("Gallery");
}

function backBtn_click() {
    document.querySelector("#page2").style.display = "none";
    document.querySelector("#page1").style.display = "block";
    document.querySelector("#designer").style.display = "none";
    document.querySelector("#viewer").style.display = "none";
    document.querySelector("#btnBack").style.display = "none";
    document.querySelector("#wynHeader").style.display = "block";
    document.querySelector("#btnSwitch").style.display = "none";
    document.querySelector("#dashboardTitle").style.display = "none";
    document.querySelector("#dashboardTitle").innerHTML = "";
    document.querySelector("#codePanel").className = "hide";

    if (viewer)
        viewer.destroy();

    if (designer)
        designer.destroy();

    loadCode("Gallery");
}

function categorylist_click(e) {
    var target = e.target;
    if (e.target.classList.contains("selected")) {
        e.target.classList.remove("selected");
        selectedCat = null;
    }
    else {
        let elements = document.getElementById('categoryList').children;
        for (let i = 0; i < elements.length; ++i) {
            elements[i].classList.remove("selected");
        }
        e.target.classList.add("selected");
        var selectedCat = target.innerText.trimStart();
        showDashboards(selectedCat);
    }
}

function showCodePanel_click() {
    var codePanel = document.getElementById("codePanel");
    codePanel.className = codePanel.className == "show" ? "hide" : "show";
}

function btnCopyCode_click() {
    var codeElement = document.getElementById("codeElement");

    const el = document.createElement('textarea');
    el.value = codeElement.textContent;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    //document.execCommand("copy");
}

function showDashboards(category) {

    var cardsList = document.getElementById("cardList");
    cardsList.innerHTML = "";

    var dashboards = [];

    if (category === "Uncategorized") {
        dashboards = docDictionary.filter((x) => {
            return x.tags.length == 0;
        });
    }
    else {
        dashboards = docDictionary.filter((x) => {
            var isTrue = false;
            if (x.tags.length > 0) {
                for (var i = 0; i < x.tags.length; i++) {
                    if (x.tags[i].name == category) {
                        isTrue = true;
                        break;
                    }
                }
            }
            return isTrue;
        });
    }

    for (var d = 0; d < dashboards.length; d++) {
        var randomNum = Math.floor(Math.random() * (11 - 1)) + 1;
        var dbdImageUrl = "Image-" + randomNum + ".png";
        var dashboardCard = document.createElement("div");
        dashboardCard.className = "card";
        dashboardCard.innerHTML = `<div style="width:100%;margin-left:5px;margin-top:5px">
                        <img class="card-img-top" src="images/` + dbdImageUrl + `" alt="dashboard" style="height:50%;width:97%">
                        </div>
                        <div style="display:flex;justify-content:center">
                        <span id="cardTitle" class="card-title">` + dashboards[d].title + `</span>
                    </div>
                    <div class="card-body">
                        <button id="btnViewDashboard" class="btn btnView" name="ViewDoc" onclick="cmdButtonClick(this)">View</button>
                        <button id="btnEditDashboard" class="btn btnDesign" name="EditDoc" onclick="cmdButtonClick(this)">Design</button>
                    </div>`;
        cardsList.appendChild(dashboardCard);
    }
}

function refreshList() {
    var dashboards = getDashboardsList();

    var ul = document.getElementById("wynList");
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    dashboards.then(function (results) {
        docDictionary = results;

        for (var i = 0; i < results.length; i++) {
            var dashboard = results[i];
            var li = document.createElement('li');
            li.setAttribute("class", "list-group-item");
            li.appendChild(document.createTextNode(dashboard.name));
            ul.appendChild(li);
        }
    });
}

//Command Buttons Click
function cmdButtonClick(e) {
    var cmdType = "", docId = "";

    switch (e.name) {
        case "ViewDoc":
            //if (selectedDocument) {
            cmdType = "view";

            var docName = e.parentElement.parentElement.getElementsByTagName("span")[0].innerText;
            selectedDocument = docDictionary.find(x => x.title === docName);

            docId = selectedDocument.id;

            document.querySelector("#page2").style.display = "block";
            document.querySelector("#page1").style.display = "none";
            document.querySelector("#designer").style.display = "none";
            document.querySelector("#viewer").style.display = "block";
            document.querySelector("#btnBack").style.display = "block";
            document.querySelector("#wynHeader").style.display = "none";
            document.querySelector("#btnSwitch").style.display = "block";
            document.querySelector("#dashboardTitle").style.display = "block";
            document.querySelector("#dashboardTitle").innerHTML = docName;
            document.querySelector("#codePanel").className = "hide";

            loadCode("Viewer");

            if (viewer)
                viewer.destroy();

            viewer = WynDashboards.create('DashboardViewer', {
                //scenario: "column-3",
                dashboardId: docId,
                edition: 'EN',
                size: "fitToScreen",
                actions: "clearselection,annotation,analysispath",
                openfulldashboardmode: "newwindow",
                containerFilterScope: '',
                version: '1.0.0',
                userId: username,
                lng: 'en',
                baseUrl: wynUrl,
                token: token,
            });
            viewer.initialize({
                container: document.querySelector('#viewer'),
                onClose: () => {
                    //console.log('close');
                },
                onLoaded: (docName) => {
                    //console.log('loaded');
                },
            });
            break;
        case "EditDoc":
            cmdType = "edit";
            var docName = e.parentElement.parentElement.getElementsByTagName("span")[0].innerText;
            selectedDocument = docDictionary.find(x => x.title === docName);
            document.querySelector("#dashboardTitle").innerHTML = docName;
            docId = selectedDocument.id;

            loadCode("Designer");

            initializeDesigner(docId);
            break;
        case "NewDoc":
            cmdType = "create";

            document.querySelector("#page2").style.display = "block";
            document.querySelector("#page1").style.display = "none";
            document.querySelector("#designer").style.display = "block";
            document.querySelector("#viewer").style.display = "none";
            document.querySelector("#btnBack").style.display = "block";
            document.querySelector("#wynHeader").style.display = "none";
            document.querySelector("#btnSwitch").style.display = "none";
            document.querySelector("#dashboardTitle").style.display = "block";
            document.querySelector("#dashboardTitle").innerHTML = "New Dashboard";
            document.querySelector("#codePanel").className = "hide";

            loadCode("NewDesigner");

            if (designer)
                designer.destroy();

            designer = WynDashboards.create('DashboardDesigner', {
                edition: 'EN',
                enableDeveloperMode: true,
                containerFilterScope: '',
                version: '1.0.0',
                userId: username,
                lng: 'en',
                baseUrl: wynUrl,
                token: token
            });
            designer.initialize({
                container: document.querySelector('#designer'),
                onClose: () => {
                    //console.log('close');
                },
                onSave: (docName) => {
                    //console.log('save');
                    //refreshList();
                },
                onLoaded: (docName) => {
                    //console.log('loaded');
                },
            });
            break;
        case "RefreshList":
            cmdType = "refresh";
            //refreshList();
            break;
        case "SwitchView":
            docId = selectedDocument.id;
            document.querySelector("#codePanel").className = "hide";
            loadCode("Designer");
            initializeDesigner(docId);
            break;
    }
}

function initializeDesigner(docId) {
    document.querySelector("#page2").style.display = "block";
    document.querySelector("#page1").style.display = "none";
    document.querySelector("#designer").style.display = "block";
    document.querySelector("#viewer").style.display = "none";
    document.querySelector("#btnBack").style.display = "block";
    document.querySelector("#wynHeader").style.display = "none";
    document.querySelector("#btnSwitch").style.display = "none";
    document.querySelector("#dashboardTitle").style.display = "block";
    document.querySelector("#codePanel").className = "hide";

    if (designer)
        designer.destroy();

    designer = WynDashboards.create('DashboardDesigner', {
        edition: 'EN',
        dashboardId: docId,
        enableDeveloperMode: true,
        containerFilterScope: '',
        version: '1.0.0',
        userId: username,
        lng: 'en',
        baseUrl: wynUrl,
        token: token
    });
    designer.initialize({
        container: document.querySelector('#designer'),
        onClose: () => {
            //console.log('close');
        },
        onSave: (docName) => {
            //console.log('save');
        },
        onLoaded: (docName) => {
            //console.log('loaded');
        },
    });
}

//Logout
function btnLogout_click() {
    document.cookie = "accessToken=\"\"";
    document.cookie = "username=\"\"";
    document.cookie = "wynurl=\"\"";

    window.location = "./Login.html";
}

function getDefaultHeaders(enableCache) {

    var headers = {
        Accept: 'application/json',
    };
    if (token) {
        headers['Reference-Token'] = token;
    }
    return headers;
}

function mapReport(report) {
    if (!report) return {};

    return {
        _id: report.id,
        Name: report.title,
        Type: report.type,
        IsCpl: report.reportType === 'CPL',
        $effectivePermissions: report.effective_ops,
        $metadata: {
            Created: report.created,
            CreatedBy: report.created_by && report.created_by.name,
            Modified: report.modified,
            ModifiedBy: report.modified_by && report.modified_by.name,
        },
    };
}

function getValue(obj, path) {
    if (!obj) return null;
    var pathParts = path.split('.');
    var value = obj;

    for (var i = 0; i < pathParts.length; i++) {
        value = value[pathParts[i]];
        if (!value) return null;
    }
    return value;
}

function graphqlRequest(query) {
    return $.ajax({
        url: wynUrl + '/api/graphql?token=' + token,
        type: 'POST',
        data: JSON.stringify({
            query: query,
        }),
        dataType: 'json',
        contentType: 'application/json',
        processData: true,
        headers: getDefaultHeaders(),
        xhrFields: {
            withCredentials: true,
        }
    });
}

function getDashboardsList() {
    return graphqlRequest(
        'query { ' +
        'documenttypes(key: \"dbd\") { ' +
        'documents(orderby: \"-created\") { ' +
        'id, ' +
        'description, ' +
        'type,' +
        'title, ' +
        'tags {id, name}, ' +
        'created_by { name }, ' +
        'created, ' +
        'modified_by { name }, ' +
        'modified, ' +
        '} ' +
        '} ' +
        '}'
    ).then(function (result) {
        console.log(result);
        var dashboardsList = getValue(result, 'data.documenttypes.0.documents') || [];
        return dashboardsList;
    });
}

function getCategoriesList() {
    return graphqlRequest(
        'query { ' +
        'tags { ' +
        'id,' +
        'name,' +
        'parentId,' +
        'color,' +
        'iconCssClass,' +
        'isFavorites, ' +
        '} ' +
        '}'
    ).then(function (result) {
        console.log(result);
        var categoriesList = getValue(result, 'data.tags') || [];
        return categoriesList;
    });
}

function extend(baseOptions, additionalOptions) {
    return $.extend({}, baseOptions || {}, additionalOptions || {});
}

function readCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}