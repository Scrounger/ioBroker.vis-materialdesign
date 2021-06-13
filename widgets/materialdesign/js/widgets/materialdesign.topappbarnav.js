/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.topappbarnav = function (el, data) {
    let widgetName = 'TopAppBar';
    let debug = myMdwHelper.getBooleanFromData(data.debug, false);

    try {
        let $this = $(el);
        let jsonData = null;

        myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

        generateContent();

        let widget = $this.get(0);
        let $mdcTopAppBar = $this.find('.mdc-top-app-bar');
        let $topAppBarTitle = $mdcTopAppBar.find('.mdc-top-app-bar__title')
        let mdcDrawer = $this.find('.mdc-drawer').get(0);

        let $drawerFrameAppContent = $this.find('.drawer-frame-app-content');

        let $mdcList = $this.find('.mdc-list');
        let mdcList = $mdcList.get(0);

        myMdwHelper.waitForElement($this, '.mdc-drawer__content', data.wid, 'TopAppBar', function () {
            // Bug fix für TopAppBar, da position: fixed sein muss, deshlab zur Laufzeit width anpassen -> wird von widget genommen
            $this.css('left', '0px');
            $this.css('top', '0px');

            // remove z-index set in css common
            $this.css('z-index', '');

            if (data.drawerMode === 'modal') {
                let width = window.getComputedStyle(widget, null).width;

                if (data.topAppBarLayout !== 'short') {
                    $mdcTopAppBar.css('width', width);
                } else {
                    $mdcTopAppBar.css('position', 'relative');
                }
            } else {
                let width = window.getComputedStyle(widget, null).width;
                let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;
                let barWidth = width.replace('px', '') - widthDrawer.replace('px', '');

                if (data.topAppBarLayout !== 'short') {
                    $mdcTopAppBar.css('width', barWidth);
                } else {
                    $mdcTopAppBar.css('left', 0);
                    $mdcTopAppBar.css('position', 'relative');
                    $mdcTopAppBar.css('width', 56);
                }
                $drawerFrameAppContent.css('left', widthDrawer);
            }
        });

        if (mdcList) {

            setLayout();
            function setLayout() {
                let colorDrawerBackground = myMdwHelper.getValueFromData(data.colorDrawerBackground, '');
                mdcDrawer.style.setProperty("--materialdesign-color-drawer-background", colorDrawerBackground);
                mdcList.style.setProperty("--materialdesign-color-drawer-sub-background", myMdwHelper.getValueFromData(data.colorDrawerSubBackground, colorDrawerBackground));

                let colorDrawerItemBackground = myMdwHelper.getValueFromData(data.colorDrawerItemBackground, colorDrawerBackground);
                mdcList.style.setProperty("--materialdesign-color-list-item-background", colorDrawerItemBackground);
                mdcList.style.setProperty("--materialdesign-color-sub-list-item-background", myMdwHelper.getValueFromData(data.colorDrawerSubItemBackground, colorDrawerItemBackground));

                let colorListItemSelected = myMdwHelper.getValueFromData(data.colorListItemSelected, '');
                mdcList.style.setProperty("--materialdesign-color-list-item-selected", colorListItemSelected);
                mdcList.style.setProperty("--materialdesign-color-sub-list-item-selected", myMdwHelper.getValueFromData(data.colorListSubItemSelected, colorListItemSelected));

                let colorListItemHover = myMdwHelper.getValueFromData(data.colorListItemHover, '');
                mdcList.style.setProperty("--materialdesign-color-list-item-hover", colorListItemHover);
                mdcList.style.setProperty("--materialdesign-color-sub-list-item-hover", myMdwHelper.getValueFromData(data.colorListSubItemHover, colorListItemHover));

                let colorListItemText = myMdwHelper.getValueFromData(data.colorListItemText, '');
                mdcList.style.setProperty("--materialdesign-color-list-item-text", colorListItemText);
                mdcList.style.setProperty("--materialdesign-color-sub-list-item-text", myMdwHelper.getValueFromData(data.colorListSubItemText, colorListItemText));

                let colorListItemTextSelected = myMdwHelper.getValueFromData(data.colorListItemTextSelected, '');
                mdcList.style.setProperty("--materialdesign-color-list-item-text-activated", colorListItemTextSelected);
                mdcList.style.setProperty("--materialdesign-color-sub-list-item-text-activated", myMdwHelper.getValueFromData(data.colorListSubItemTextSelected, colorListItemTextSelected));



                mdcList.style.setProperty("--materialdesign-color-list-item-header", myMdwHelper.getValueFromData(data.colorListItemHeaders, ''));
                mdcList.style.setProperty("--materialdesign-color-list-item-divider", myMdwHelper.getValueFromData(data.colorListItemDivider, ''));

                mdcList.style.setProperty("--materialdesign-color-sub-list-item-divider", myMdwHelper.getValueFromData(data.colorListSubItemDivider, ''));

                let colorDrawerbackdropLabelBackground = myMdwHelper.getValueFromData(data.colorDrawerbackdropLabelBackground, '');
                mdcList.style.setProperty("--materialdesign-color-list-item-backdrop", colorDrawerbackdropLabelBackground);
                mdcList.style.setProperty("--materialdesign-color-sub-list-item-backdrop", myMdwHelper.getValueFromData(data.colorDrawerbackdropSubLabelBackground, colorDrawerbackdropLabelBackground));

                let colorDrawerbackdropLabelBackgroundActive = myMdwHelper.getValueFromData(data.colorDrawerbackdropLabelBackgroundActive, '');
                mdcList.style.setProperty("--materialdesign-color-list-item-backdrop-activated", colorDrawerbackdropLabelBackgroundActive);
                mdcList.style.setProperty("--materialdesign-color-sub-list-item-backdrop-activated", myMdwHelper.getValueFromData(data.colorDrawerbackdropSubLabelBackgroundActive, colorDrawerbackdropLabelBackgroundActive));

                mdcList.style.setProperty("--materialdesign-color-list-item-text-disabled", myMdwHelper.getValueFromData(data.colorListItemTextDisabled, ''));
                mdcList.style.setProperty("--materialdesign-color-list-item-icon-disabled", myMdwHelper.getValueFromData(data.colorListItemIconDisabled, ''));

                let itemFont = myMdwHelper.getValueFromData(data.listItemTextFont, '');
                mdcList.style.setProperty("--materialdesign-font-top-app-bar-item", itemFont);

                let itemFontDisabled = myMdwHelper.getValueFromData(data.listItemTextFontDisabled, itemFont)
                mdcList.style.setProperty("--materialdesign-font-top-app-bar-item-disabled", itemFontDisabled);

                mdcList.style.setProperty("--materialdesign-font-top-app-bar-sub-item", myMdwHelper.getValueFromData(data.listItemSubTextFont, itemFont));
                mdcList.style.setProperty("--materialdesign-font-top-app-bar-sub-item-disabled", myMdwHelper.getValueFromData(data.listItemSubTextFontDisabled, itemFontDisabled));

                mdcList.style.setProperty("--materialdesign-font-list-item-header", myMdwHelper.getValueFromData(data.listItemHeaderFont, ''));

                mdcDrawer.style.setProperty("--materialdesign-color-top-app-bar-header-background", myMdwHelper.getValueFromData(data.colorDrawerHeaderBackground, ''));

                let headerFontSize = myMdwHelper.getFontSize(data.listItemHeaderTextSize);
                if (headerFontSize && headerFontSize.style) {
                    $this.find('.mdc-list-group__subheader').css('font-size', myMdwHelper.getStringFromNumberData(data.listItemHeaderTextSize, 'inherit', '', 'px'));
                }

                let dawerLabelFontSize = myMdwHelper.getFontSize(data.listItemTextSize);
                if (dawerLabelFontSize && dawerLabelFontSize.style) {
                    $this.find('.mdc-list-item__text').css('font-size', myMdwHelper.getStringFromNumberData(data.listItemTextSize, 'inherit', '', 'px'));
                }

                let dawerSubItemLabelFontSize = myMdwHelper.getFontSize(data.listSubItemTextSize);
                if (dawerSubItemLabelFontSize && dawerSubItemLabelFontSize.style) {
                    $this.find('.isSubItem .mdc-list-item__text').css('font-size', myMdwHelper.getStringFromNumberData(data.listSubItemTextSize, 'inherit', '', 'px'));
                }

                // Top Bar
                $mdcTopAppBar.get(0).style.setProperty("--materialdesign-color-top-app-bar-background", myMdwHelper.getValueFromData(data.colorTopAppBarBackground, ''));
                $mdcTopAppBar.get(0).style.setProperty("--materialdesign-font-top-app-bar-title", myMdwHelper.getValueFromData(data.titleFont, ''));
                $mdcTopAppBar.get(0).style.setProperty("--materialdesign-font-size-top-app-bar-title", myMdwHelper.getNumberFromData(data.titleFontSize, 20) + 'px');
                $mdcTopAppBar.get(0).style.setProperty("--materialdesign-color-top-app-bar-title", myMdwHelper.getValueFromData(data.colorTopAppBarTitle, ''));
                $mdcTopAppBar.get(0).style.setProperty("--materialdesign-top-app-bar-color-burger-icon", myMdwHelper.getValueFromData(data.topAppBarIconColor, ''));


                $this.find(`.mdc-list-item`).not(".mdc-list-item.isSubItem").each(function (itemIndex) {
                    let listItemObj = getListItemObj(itemIndex, data, jsonData);

                    $(this).find('.materialdesign-icon-image').css('color', listItemObj.iconColor);
                    $(this).find('.toggleIcon').css('color', myMdwHelper.getValueFromData(data.colorSubItemToggleIcon, '#44739e'));

                    let realIndex = parseInt($(this).attr('index'));
                    if ($(this).hasClass('hasSubItems')) {
                        let subMenuObjects = listItemObj.subMenus;

                        if (subMenuObjects) {
                            for (var subIndex = 0; subIndex <= subMenuObjects.length - 1; subIndex++) {
                                $this.find(`.isSubItem[index="${realIndex + 1 + subIndex}"] .materialdesign-icon-image`)
                                    .css('color', myMdwHelper.getValueFromData(subMenuObjects[subIndex].iconColor, listItemObj.subMenuIconColor));
                            }
                        }
                    }
                });
            }

            const drawer = new mdc.drawer.MDCDrawer(mdcDrawer);
            const topAppBar = new mdc.topAppBar.MDCTopAppBar($mdcTopAppBar.get(0));
            const navList = new mdc.list.MDCList(mdcList);

            const listItemRipples = navList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));

            topAppBar.setScrollTarget($this.find('.mdc-top-app-bar-content').get(0));

            topAppBar.listen('MDCTopAppBar:nav', () => {

                vis.binds.materialdesign.helper.vibrate(data.vibrateTopAppBarOnMobilDevices);

                if (data.drawerMode === 'dismissible') {
                    if (drawer.open) {
                        let width = window.getComputedStyle(widget, null).width;
                        let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;

                        if (data.topAppBarLayout !== 'short') {
                            $mdcTopAppBar.css('width', width);
                        } else {
                            if (!vis.editMode) {
                                $mdcTopAppBar.css('left', '0px');
                            }
                        }
                        $drawerFrameAppContent.css('left', '0px');

                        drawer.open = !drawer.open;
                    } else {
                        let width = window.getComputedStyle(widget, null).width;
                        let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;
                        let barWidth = width.replace('px', '') - widthDrawer.replace('px', '');

                        drawer.open = !drawer.open;

                        setTimeout(function () {
                            if (data.topAppBarLayout !== 'short') {
                                $mdcTopAppBar.css('width', barWidth);
                            } else {
                                if (!vis.editMode) {
                                    $mdcTopAppBar.css('left', widthDrawer);
                                }
                            }
                            $drawerFrameAppContent.css('left', widthDrawer);
                        }, 250);
                    }
                } else {
                    drawer.open = !drawer.open;
                }
            });

            let val = vis.states.attr(data.oid + '.val');

            navListSelect(val);
            setTopAppBarWithDrawerLayout(val);

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                navListSelect(newVal);
                setTopAppBarWithDrawerLayout(newVal);
            });

            $(document).on("mdwSubscribe", function (e, oids) {
                if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                    setLayout();
                }
            });

            vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                setLayout();
            });

            vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                setLayout();
            });

            $(window).resize(function () {
                // resize event
                if (data.drawerLayout === 'auto') {
                    let windowWidth = parseInt($(window).width());
                    let resHigherThan = myMdwHelper.getNumberFromData(data.permanentIfResolutionHigherThan, 5000);

                    if (data.drawerMode === 'modal' && windowWidth >= resHigherThan) {
                        vis.reRenderWidget(vis.activeViewDiv, vis.activeView, data.wid);
                        if (debug) console.log(`[${widgetName} ${data.wid}] window resolution '${windowWidth}' >= '${resHigherThan}' -> change to permanent -> reRender Widget '${data.wid}'`);
                    } else if (data.drawerMode === 'permanent' && windowWidth < resHigherThan) {
                        vis.reRenderWidget(vis.activeViewDiv, vis.activeView, data.wid);
                        if (debug) console.log(`[${widgetName} ${data.wid}] window resolution '${windowWidth}' < '${resHigherThan}' -> change to modal -> reRender Widget '${data.wid}'`);
                    }
                }
            });

            $mdcList.find('.mdc-list-item').on('click', function () {
                let $selectedItem = $(this).eq(0);
                let selectIndex = parseInt($selectedItem.attr('id').replace('listItem_', ''));

                let itemIsDisabled = $selectedItem.hasClass('mdc-list-item--disabled');

                vis.binds.materialdesign.helper.vibrate(data.vibrateDrawerOnMobilDevices);

                if (!itemIsDisabled) {
                    if ($(this).hasClass('hasSubItems')) {
                        // listItem has subItems ->Toggle SubItems
                        if ($(this).hasClass('toggled')) {
                            $(this).removeClass("toggled");

                            $(this).find('.toggleIcon').removeClass("mdi-menu-up");
                            $(this).find('.toggleIcon').addClass("mdi-menu-down");
                        } else {
                            $(this).addClass("toggled");
                            $(this).find('.toggleIcon').removeClass("mdi-menu-down");
                            $(this).find('.toggleIcon').addClass("mdi-menu-up");
                        }

                        $(this).next("nav.mdc-sub-list").toggle();

                        navList.selectedIndex = parseInt($mdcList.find(`.mdc-list-item[id="listItem_${selectIndex}"]`).eq(0).attr('index'));

                        let setValueOnToggle = $selectedItem.attr('set-value-on-menu-toggle')
                        if (setValueOnToggle && setValueOnToggle === 'true') {
                            myMdwHelper.setValue(data.oid, selectIndex);
                        }
                    } else {
                        // listItem
                        val = vis.states.attr(data.oid + '.val');

                        if (val != selectIndex) {
                            myMdwHelper.setValue(data.oid, selectIndex);

                            // setTopAppBarWithDrawerLayout(selectIndex);

                            setTimeout(function () {
                                window.scrollTo({ top: 0, left: 0, });
                            }, 50);
                        }

                        if (data.drawerMode === 'modal') {
                            drawer.open = false;
                        }
                    }
                }
            });

            function setTopAppBarWithDrawerLayout(index) {
                let $selectedItem = $mdcList.find(`div[id="listItem_${index}"]`);
                let selectedName = $selectedItem.find(`.mdc-list-item__text`).text();

                if (myMdwHelper.getBooleanFromData(data.showSelectedItemAsTitle, true)) {
                    if (myMdwHelper.getBooleanFromData(data.showSelectedItemIconInTitle, true)) {
                        let $icon = $selectedItem.find('.materialdesign-icon-image');

                        if ($icon.length > 0 && $icon[0]) {
                            let iconOrImage = undefined;
                            let iconHtml = undefined;
                            if ($icon.attr('src')) {
                                iconOrImage = $icon.attr('src');
                                iconHtml = myMdwHelper.getIconElement(iconOrImage, 'auto', myMdwHelper.getValueFromData(data.iconTitleHeight, '30px'), '', 'margin-right: 10px;');
                            } else {
                                if ($icon[0].classList && $icon[0].classList[1] && $icon[0].classList[1].startsWith('mdi-')) {
                                    iconOrImage = $icon[0].classList[1].replace('mdi-', '');
                                    iconHtml = myMdwHelper.getIconElement(iconOrImage, 'auto', myMdwHelper.getValueFromData(data.iconTitleHeight, '30px'), '', 'margin-right: 10px;');
                                }
                            }

                            if (iconHtml) {
                                $topAppBarTitle.html(`${iconHtml}${selectedName}`);
                            } else {
                                $topAppBarTitle.text(selectedName);
                            }
                        } else {
                            $topAppBarTitle.text(selectedName);
                        }
                    } else {
                        $topAppBarTitle.text(selectedName);
                    }
                }

                if (data.selectedItemName_oid) {
                    let parentIndex = $selectedItem.attr('parentIndex');

                    if (parentIndex) {
                        let parentName = $mdcList.find(`span[id="listItem_${parentIndex}"]`).text();
                        let parentItem = $mdcList.find(`div[id="listItem_${parentIndex}"]`);

                        let parentMenuId = parentItem.attr('menuId');
                        let selectedMenuId = $selectedItem.attr('menuId');

                        myMdwHelper.setValue(data.selectedItemName_oid, `${parentMenuId ? parentMenuId : parentName.replace(`[${parentIndex}] `, '').trim()}.${selectedMenuId ? selectedMenuId : selectedName.replace(`[${index}] `, '').trim()}`);
                    } else {
                        let selectedMenuId = $selectedItem.attr('menuId');

                        if (selectedMenuId) {
                            myMdwHelper.setValue(data.selectedItemName_oid, selectedMenuId.trim());
                        } else {
                            myMdwHelper.setValue(data.selectedItemName_oid, selectedName.replace(`[${index}] `, '').trim());
                        }
                    }
                }

            }

            function toggleSubItemByIndex(index) {
                let selectedListItem = $mdcList.find(`.mdc-list-item[id="listItem_${index}"]`);
                if (selectedListItem.hasClass('isSubItem')) {
                    // toggle Subitem if selected
                    let parentListItem = selectedListItem.parent().prev('.hasSubItems');

                    if (!parentListItem.hasClass("toggled")) {
                        parentListItem.addClass("toggled");

                        parentListItem.find('.toggleIcon').removeClass("mdi-menu-down");
                        parentListItem.find('.toggleIcon').addClass("mdi-menu-up");

                        parentListItem.next("nav.mdc-sub-list").toggle();
                    }
                }
            }

            function navListSelect(val) {

                if (!data.navDisableDefaultValue) {
                    let item = $mdcList.find(`.mdc-list-item[id="listItem_${val}"]`);

                    if (item.length === 0) {
                        // Element is hidden
                        myMdwHelper.setValue(data.oid, myMdwHelper.getNumberFromData(data.navDefaultValue, 0));
                    } else {
                        if (item.hasClass('mdc-list-item--disabled')) {
                            // element is disabled
                            // if (item.hasClass('isSubItem')) {
                            //     let parentListItem = item.parent().prev('.hasSubItems');

                            //     if (parentListItem.hasClass('mdc-list-item--disabled')) {
                            //         parentListItem.removeClass("toggled");

                            //         parentListItem.find('.toggleIcon').removeClass("mdi-menu-up");
                            //         parentListItem.find('.toggleIcon').addClass("mdi-menu-down");
                            //     }
                            // }
                            myMdwHelper.setValue(data.oid, myMdwHelper.getNumberFromData(data.navDefaultValue, 0));
                        } else {
                            navList.selectedIndex = parseInt(item.eq(0).attr('index'));
                            toggleSubItemByIndex(val);
                            // setTopAppBarWithDrawerLayout(val);
                        }
                    }
                }
            }
        }

        function generateContent(replace = false) {
            try {
                if (data.drawerLayout === 'auto') {
                    if ($(window).width() >= myMdwHelper.getNumberFromData(data.permanentIfResolutionHigherThan, 5000)) {
                        data.drawerMode = 'permanent'
                    } else {
                        data.drawerMode = 'modal'
                    }
                } else {
                    data.drawerMode = data.drawerLayout;
                }

                let initDrawer = generateDrawer(data, widgetName);
                let initTopAppBar = generateTopAppBar(data, widgetName);

                $this.append(`<div class="drawer-frame-root">
                                    <aside class="mdc-drawer ${initDrawer.drawerLayout}" ${initDrawer.drawerStyle}>
                                        ${initDrawer.drawerHeader}
                                        <div class="mdc-drawer__content">
                                            <nav class="mdc-list">
                                                ${initDrawer.drawerItemList}
                                            </nav>
                                        </div>
                                    </aside>
                                    ${initDrawer.drawerModalScrim}
                                    <div class="drawer-frame-app-content">
                                        <header class="mdc-top-app-bar drawer-top-app-bar ${initTopAppBar.headerLayout}" ${initTopAppBar.headerStyle}>
                                            <div class="mdc-top-app-bar__row" style="color: ${data.colorTopAppBarTitle}">
                                                <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                                                    ${initTopAppBar.headerButtonShow}
                                                    <span class="mdc-top-app-bar__title">${data.titleTopAppBar}</span></section>
                                            </div>
                                        </header>
                                        <div class="mdc-top-app-bar-content ${initTopAppBar.contentLayout}">
                                        </div>
                                    </div>
                                </div>`);

            } catch (ex) {
                console.error(`[${widgetName} - ${data.wid}] generateContent: error: ${ex.message}, stack: ${ex.stack}`);
            }
        }

        function generateTopAppBar(data, widgetName) {
            try {
                let headerLayout = '';
                let topBarZIndex = myMdwHelper.getValueFromData(data.topAppBarZ_index, '', 'z-index: ', ';');
                let headerStyle = `style="${topBarZIndex}"`;
                let headerButtonShow = '';
                let contentLayout = '';

                if (data.topAppBarLayout === 'standard') {
                    contentLayout = 'mdc-top-app-bar--fixed-adjust';
                } else if (data.topAppBarLayout === 'dense') {
                    headerLayout = 'mdc-top-app-bar--dense';
                    contentLayout = 'mdc-top-app-bar--dense-fixed-adjust';
                } else if (data.topAppBarLayout === 'short') {
                    headerLayout = 'mdc-top-app-bar--short mdc-top-app-bar--short-collapsed';
                    contentLayout = 'mdc-top-app-bar--short-fixed-adjust';
                }

                if (data.drawerMode === 'modal') {
                    headerButtonShow = `<button 
                                                class="mdc-icon-button material-icons mdc-top-app-bar__navigation-icon mdc-ripple-upgraded--unbounded mdc-ripple-upgraded" 
                                                style="--mdc-ripple-fg-size:28px; --mdc-ripple-fg-scale:1.7142857142857142; --mdc-ripple-left:10px; --mdc-ripple-top:10px;">
                                                    menu
                                                </button>`;
                }

                return { headerLayout: headerLayout, headerStyle: headerStyle, contentLayout: contentLayout, headerButtonShow: headerButtonShow }

            } catch (ex) {
                console.error(`[${widgetName} - ${data.wid}] generateTopAppBar: error: ${ex.message}, stack: ${ex.stack}`);
            }
        }

        function generateDrawer(data, widgetName) {
            try {
                let viewsList = [];
                let navItemList = [];
                let drawerHeader = '';
                let drawerLayout = '';
                let drawerStyle = '';
                let drawerModalScrim = '';

                initLayoutAndStyle();
                initHeader();
                initListItems();

                return { viewsList: viewsList, drawerItemList: navItemList.join(''), drawerHeader: drawerHeader, drawerLayout: drawerLayout, drawerStyle: drawerStyle, drawerModalScrim: drawerModalScrim };

                function initLayoutAndStyle() {
                    let width = myMdwHelper.getValueFromData(data.drawerWidth, '', 'width: ', 'px;');

                    let drawerZIndex = '';
                    let drawerScrimZIndex = '';
                    if (data.z_index !== undefined && data.z_index !== null && data.z_index !== '') {
                        drawerZIndex = `z-index: ${data.z_index};`;
                        drawerScrimZIndex = `z-index: ${data.z_index - 1};`;
                    }

                    if (data.drawerMode === 'modal') {
                        drawerLayout = 'mdc-drawer--modal';
                        drawerModalScrim = `<div class="mdc-drawer-scrim" style="${drawerScrimZIndex}"></div>`;
                    } else {
                        // Layout dismissible & permanent
                        drawerLayout = 'mdc-drawer--dismissible mdc-drawer--open';
                    }

                    drawerStyle = `style="${width}${drawerZIndex}"`;
                }

                function initHeader() {
                    if (data.showHeader === true || data.showHeader === 'true') {
                        drawerHeader = `<div class="mdc-drawer__header">
                                                ${data.headerLabel}
                                            </div>`;
                    }
                }

                function initListItems() {
                    let headerFontSize = myMdwHelper.getFontSize(data.listItemHeaderTextSize);
                    let drawerIconHeight = myMdwHelper.getValueFromData(data.drawerIconHeight, '', 'height: ', 'px !important;');
                    let drawerSubItemIconHeight = myMdwHelper.getValueFromData(data.drawerSubItemIconHeight, drawerIconHeight, 'height: ', 'px !important;');

                    let dawerLabelFontSize = myMdwHelper.getFontSize(data.listItemTextSize);
                    let dawerSubItemLabelFontSize = myMdwHelper.getFontSize(data.listSubItemTextSize);
                    let dawerLabelShow = (data.showLabels) ? '' : 'display: none;';
                    let dawerSubItemsLabelShow = (data.showSubItemsLabels) ? '' : 'display: none;';

                    // only for Layout Backdrop
                    let backdropLabelBackgroundHeight = myMdwHelper.getValueFromData(data.backdropLabelBackgroundHeight, 'height: auto;', 'height: ', '%;');
                    let backdropSubLabelBackgroundHeight = myMdwHelper.getValueFromData(data.backdropSubLabelBackgroundHeight, backdropLabelBackgroundHeight, 'height: ', '%;');

                    let countOfItems = data.navItemCount;
                    if (data.drawerItemsDataMethod === 'jsonStringObject') {
                        try {
                            jsonData = JSON.parse(data.drawerItemsJsonString);
                        } catch (err) {
                            jsonData = [{
                                text: _("Error in JSON string"),
                                icon: 'alert',
                                iconColor: 'red'
                            }]
                            console.error(`[${widgetName} - ${data.wid}] cannot parse json string! value: '${data.drawerItemsJsonString}' Error: ${err.message}`);
                        }
                        countOfItems = jsonData.length - 1;
                    }

                    let itemIndex = 0;
                    let selectIndex = 0;
                    for (var i = 0; i <= countOfItems; i++) {
                        let listItemObj = getListItemObj(i, data, jsonData);

                        if (listItemObj) {
                            let subItemsCount = listItemObj.subMenus ? listItemObj.subMenus.length : 0;
                            let hasSubItems = listItemObj.subMenus && listItemObj.subMenus.length > 0;

                            // Permission group
                            let itemIsDisabled = false;
                            let userGroups = listItemObj.userGroups;
                            if (userGroups) {
                                if (!vis.isUserMemberOf(vis.conn.getUser(), userGroups)) {
                                    if (listItemObj.behaviorNotInUserGroup === 'hide') {
                                        // not in group and hide option selected
                                        itemIndex = itemIndex + subItemsCount + 1;
                                        continue;
                                    } else {
                                        // not in group and disabled option selected
                                        itemIsDisabled = true;
                                    }
                                }
                            }

                            // generate Header
                            let header = myMdwHelper.getListItemHeader(listItemObj.header, headerFontSize);
                            navItemList.push(header);

                            // generate Item -> mdc-list-item
                            let listItem = myMdwHelper.getListItem(data.drawerItemLayout, itemIndex, listItemObj.icon, hasSubItems, false, drawerIconHeight, '', '', '', itemIsDisabled, selectIndex, undefined, listItemObj.setValueOnMenuToggleClick, listItemObj.menuId);

                            // generate Item Image for Layout Standard
                            let listItemImage = ''
                            if (data.drawerItemLayout === 'standard') {
                                listItemImage = myMdwHelper.getListIcon(listItemObj.icon, 'auto', myMdwHelper.getValueFromData(data.drawerIconHeight, '', '', 'px !important;'), listItemObj.iconColor);
                            }

                            // add itemIndex to label if enabled
                            let itemLabelText = listItemObj.text;
                            if (data.showIndexNum) {
                                itemLabelText = `[${itemIndex}] ${itemLabelText}`;
                            }

                            // generate Item Label
                            let listItemLabel = myMdwHelper.getListItemLabel(data.drawerItemLayout, itemIndex, itemLabelText, hasSubItems, dawerLabelFontSize, dawerLabelShow, data.colorSubItemToggleIcon, backdropLabelBackgroundHeight, false, data.listItemAlignment);

                            // generate Item
                            navItemList.push(`${listItem}${listItemImage}${listItemLabel}</div>`);

                            // generate SubItems
                            if (hasSubItems) {
                                navItemList.push(`<nav class="mdc-list mdc-sub-list">`);
                                let parentIndex = itemIndex;

                                for (var d = 0; d <= subItemsCount - 1; d++) {
                                    let subObj = listItemObj.subMenus[d];

                                    itemIndex++;

                                    // Permission group
                                    let subItemIsDisabled = false;
                                    let userGroups = subObj.userGroups;
                                    if (userGroups) {
                                        if (!vis.isUserMemberOf(vis.conn.getUser(), userGroups)) {
                                            if (subObj.behaviorNotInUserGroup === 'hide') {
                                                // not in group and hide option selected
                                                continue;
                                            } else {
                                                // not in group and disabled option selected
                                                subItemIsDisabled = true;
                                            }
                                        }
                                    }

                                    selectIndex++;

                                    let subItemImage = myMdwHelper.getValueFromData(subObj.icon, '');

                                    let subItemText = '';
                                    if (subObj && subObj.text) {
                                        subItemText = myMdwHelper.getValueFromData(subObj.text, 'Menu SubItem');
                                    } else {
                                        subItemText = 'Menu SubItem';
                                    }

                                    if (data.showIndexNum) {
                                        subItemText = `[${itemIndex}] ${subItemText}`;
                                    }

                                    // generate SubItem -> mdc-list-item
                                    let listSubItem = myMdwHelper.getListItem(data.drawerSubItemLayout, itemIndex, subItemImage, false, true, drawerSubItemIconHeight, '', '', '', itemIsDisabled || subItemIsDisabled, selectIndex, parentIndex, false, subObj.menuId);

                                    // generate Item Image for Layout Standard
                                    let listSubItemImage = ''
                                    if (data.drawerSubItemLayout === 'standard') {
                                        listSubItemImage = myMdwHelper.getListIcon(subItemImage, 'auto', myMdwHelper.getValueFromData(data.drawerSubItemIconHeight, myMdwHelper.getValueFromData(data.drawerIconHeight, ''), '', 'px !important;'), myMdwHelper.getValueFromData(subObj.iconColor, listItemObj.subMenuIconColor));
                                    }

                                    // generate Item Label
                                    let listSubItemLabel = myMdwHelper.getListItemLabel(data.drawerSubItemLayout, itemIndex, subItemText, false, dawerSubItemLabelFontSize, dawerSubItemsLabelShow, '', backdropSubLabelBackgroundHeight, true, data.listSubItemAlignment);

                                    // generate SubItem
                                    navItemList.push(`${listSubItem}${listSubItemImage}${listSubItemLabel}</div>`);

                                    if (subObj.divider) {
                                        navItemList.push(myMdwHelper.getListItemDivider(true, data.listSubItemDividerStyle, true));
                                    }
                                }
                                navItemList.push(`</nav>`);
                            }

                            // generate Divider
                            navItemList.push(myMdwHelper.getListItemDivider(listItemObj.divider, data.listItemDividerStyle));

                            itemIndex++;
                            selectIndex++;
                        }
                    }
                }
            } catch (ex) {
                console.error(`[${widgetName} - ${data.wid}] generateDrawer: error: ${ex.message}, stack: ${ex.stack}`);
            }
        }

        function getListItemObj(i, data, jsonData) {
            if (data.drawerItemsDataMethod === 'inputPerEditor') {
                // Data from Editor
                let obj = {
                    menuId: myMdwHelper.getValueFromData(data.attr('menuId' + i), undefined),
                    text: myMdwHelper.getValueFromData(data.attr('labels' + i), 'Menu Item'),
                    header: myMdwHelper.getValueFromData(data.attr('headers' + i), null),
                    divider: myMdwHelper.getBooleanFromData(data.attr('dividers' + i), false),
                    icon: myMdwHelper.getValueFromData(data.attr('iconDrawer' + i), ''),
                    iconColor: myMdwHelper.getValueFromData(data.attr('iconDrawerColor' + i), '#44739e'),
                    subMenuIconColor: myMdwHelper.getValueFromData(data.attr('subIconDrawerColor' + i), '#44739e'),
                    setValueOnMenuToggleClick: myMdwHelper.getBooleanFromData(data.attr('setValueOnMenuToggleClick' + i), false),
                    userGroups: myMdwHelper.getValueFromData(data.attr('permissionGroupSelector' + i), undefined),
                    behaviorNotInUserGroup: myMdwHelper.getValueFromData(data.attr('permissionVisibility' + i), undefined)
                }

                if (myMdwHelper.getValueFromData(data.attr('submenus' + i), undefined)) {
                    try {
                        obj.subMenus = JSON.parse(data.attr('submenus' + i));
                    } catch (err) {
                        obj.subMenus = [{
                            text: _("Error in JSON string"),
                            icon: 'alert',
                            iconColor: 'red'
                        }]
                        console.error(`[${widgetName} - ${data.wid}] cannot parse subMenu json string! value: '${data.attr('submenus' + i)}' Error: ${err.message}`);
                    }
                }

                return obj;

            } else {
                // Data from json
                if (jsonData[i]) {
                    return {
                        menuId: myMdwHelper.getValueFromData(jsonData[i].menuId, undefined),
                        text: myMdwHelper.getValueFromData(jsonData[i].text, 'Menu Item'),
                        header: myMdwHelper.getValueFromData(jsonData[i].header, null),
                        divider: myMdwHelper.getBooleanFromData(jsonData[i].divider, false),
                        icon: myMdwHelper.getValueFromData(jsonData[i].icon, ''),
                        iconColor: myMdwHelper.getValueFromData(jsonData[i].iconColor, '#44739e'),
                        subMenuIconColor: myMdwHelper.getValueFromData(jsonData[i].subMenuIconColor, '#44739e'),
                        setValueOnMenuToggleClick: myMdwHelper.getBooleanFromData(jsonData[i].setValueOnMenuToggleClick, false),
                        userGroups: myMdwHelper.getValueFromData(jsonData[i].permissionGroup, undefined),
                        behaviorNotInUserGroup: myMdwHelper.getValueFromData(jsonData[i].permissionVisibility, undefined),
                        subMenus: jsonData[i].subMenus
                    }
                } else {
                    return undefined
                }
            }
        }

    } catch (ex) {
        console.error(`[${widgetName} - ${data.wid}] handle: error: ${ex.message}, stack: ${ex.stack}`);
    }
}