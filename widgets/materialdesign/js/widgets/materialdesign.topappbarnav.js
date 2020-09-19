/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.topappbarnav = {
    initializeTopAppBar: function (data) {
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

            if (data.drawerLayout === 'modal') {
                headerButtonShow = `<button 
                                        class="mdc-icon-button material-icons mdc-top-app-bar__navigation-icon mdc-ripple-upgraded--unbounded mdc-ripple-upgraded" 
                                        style="--mdc-ripple-fg-size:28px; --mdc-ripple-fg-scale:1.7142857142857142; --mdc-ripple-left:10px; --mdc-ripple-top:10px;${myMdwHelper.getValueFromData(data.colorTopAppBarTitle, '', 'color: ', ';')}">
                                            menu
                                        </button>`;
            }

            return { headerLayout: headerLayout, headerStyle: headerStyle, contentLayout: contentLayout, headerButtonShow: headerButtonShow }

        } catch (ex) {
            console.error(`[TopAppBar - ${data.wid}] initializeTopAppBar: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    initializeDrawer: function (data) {
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

                if (data.drawerLayout === 'modal') {
                    drawerLayout = 'mdc-drawer--modal';
                    drawerModalScrim = `<div class="mdc-drawer-scrim" style="${drawerScrimZIndex}"></div>`;
                } else {
                    // Layout dismissible & permanent
                    drawerLayout = 'mdc-drawer--dismissible mdc-drawer--open';
                }

                drawerStyle = `style="${width}${drawerZIndex}"`;
            }

            function initHeader() {
                if (data.attr('showHeader') === true || data.attr('showHeader') === 'true') {
                    drawerHeader = `<div 
                                        class="mdc-drawer__header" 
                                        ${myMdwHelper.getValueFromData(data.colorDrawerHeaderBackground, '', 'style="background: ', '"')}>
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

                let itemIndex = 0;
                let selectIndex = 0;
                for (var i = 0; i <= data.navItemCount; i++) {

                    let itemHeaderText = myMdwHelper.getValueFromData(data.attr('headers' + i), null);
                    let itemLabelText = myMdwHelper.getValueFromData(data.attr('labels' + i), 'Menu Item');
                    let itemImage = myMdwHelper.getValueFromData(data.attr('iconDrawer' + i), '');


                    let subMenuObjects = undefined;
                    let subItemsCount = 0;
                    let hasSubItems = false;
                    if (myMdwHelper.getValueFromData(data.attr('submenus' + i), undefined)) {
                        try {
                            subMenuObjects = JSON.parse(data.attr('submenus' + i));
                            subItemsCount = subMenuObjects.length;
                            hasSubItems = true;
                        } catch (e) {
                            itemLabelText = _('Error in submenu JSON');
                        }
                    }

                    // Permission group
                    let itemIsDisabled = false;
                    let userGroups = data['permissionGroupSelector' + i];
                    if (userGroups) {
                        if (!vis.isUserMemberOf(vis.conn.getUser(), userGroups)) {
                            if (data['permissionVisibility' + i] === 'hide') {
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
                    let header = myMdwHelper.getListItemHeader(itemHeaderText, headerFontSize);
                    navItemList.push(header);

                    // generate Item -> mdc-list-item
                    let listItem = myMdwHelper.getListItem(data.drawerItemLayout, itemIndex, itemImage, hasSubItems, false, drawerIconHeight, '', '', '', itemIsDisabled, selectIndex);

                    // generate Item Image for Layout Standard
                    let listItemImage = ''
                    if (data.drawerItemLayout === 'standard') {
                        listItemImage = myMdwHelper.getListIcon(itemImage, 'auto', myMdwHelper.getValueFromData(data.drawerIconHeight, '', '', 'px !important;'), data.attr('iconDrawerColor' + i));
                    }

                    // add itemIndex to label if enabled
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

                        for (var d = 0; d <= subItemsCount - 1; d++) {
                            let subObj = subMenuObjects[d];
                            itemIndex++;
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
                            let listSubItem = myMdwHelper.getListItem(data.drawerSubItemLayout, itemIndex, subItemImage, false, true, drawerSubItemIconHeight, '', '', '', itemIsDisabled, selectIndex);

                            // generate Item Image for Layout Standard
                            let listSubItemImage = ''
                            if (data.drawerSubItemLayout === 'standard') {
                                listSubItemImage = myMdwHelper.getListIcon(subItemImage, 'auto', myMdwHelper.getValueFromData(data.drawerSubItemIconHeight, myMdwHelper.getValueFromData(data.drawerIconHeight, ''), '', 'px !important;'), myMdwHelper.getValueFromData(subObj.iconColor, data.attr('iconDrawerColor' + i)));
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
                    navItemList.push(myMdwHelper.getListItemDivider(data.attr('dividers' + i), data.listItemDividerStyle));

                    itemIndex++;
                    selectIndex++;
                }
            }
        } catch (ex) {
            console.error(`[TopAppBar - ${data.wid}] initializeDrawer: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handler: function (el, data) {
        try {
            let $this = $(el);

            let widget = $this.parent().parent().get(0);
            let mdcDrawer = $this.context;
            let mdcTopAppBar = $this.parent().find('.mdc-top-app-bar').get(0);
            let mdcList = $this.parent().find('.mdc-list').get(0);

            myMdwHelper.waitForElement($this.parent().parent(), '.mdc-top-app-bar__navigation-icon', data.wid, 'TopAppBar', function () {
                // Bug fix für TopAppBar, da position: fixed sein muss, deshlab zur Laufzeit width anpassen -> wird von widget genommen
                $this.parent().parent().css('left', '0px');
                $this.parent().parent().css('top', '0px');

                // remove z-index set in css common
                $this.parent().parent().css('z-index', '');

                if (data.drawerLayout === 'modal') {
                    let width = window.getComputedStyle(widget, null).width;

                    if (data.topAppBarLayout !== 'short') {
                        $this.parent().find('.mdc-top-app-bar').css('width', width);
                    } else {
                        if (vis.editMode) {
                            $this.parent().find('.mdc-top-app-bar').css('position', 'relative');
                        }
                    }
                } else {
                    let width = window.getComputedStyle(widget, null).width;
                    let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;
                    let barWidth = width.replace('px', '') - widthDrawer.replace('px', '');

                    if (data.topAppBarLayout !== 'short') {
                        $this.parent().find('.mdc-top-app-bar').css('width', barWidth);
                    } else {
                        if (!vis.editMode) {
                            $this.parent().find('.mdc-top-app-bar').css('left', widthDrawer);
                        } else {
                            $this.parent().find('.mdc-top-app-bar').css('position', 'relative');
                        }
                    }
                    $this.parent().find('.drawer-frame-app-content').css('left', widthDrawer);
                }
            });

            if (mdcList) {
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

                mdcTopAppBar.style.setProperty("--materialdesign-color-top-app-bar-background", myMdwHelper.getValueFromData(data.colorTopAppBarBackground, ''));

                const drawer = new mdc.drawer.MDCDrawer(mdcDrawer);
                const topAppBar = new mdc.topAppBar.MDCTopAppBar(mdcTopAppBar);
                const navList = new mdc.list.MDCList(mdcList);

                const listItemRipples = navList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));

                topAppBar.setScrollTarget($this.parent().find('.mdc-top-app-bar-content').get(0));

                topAppBar.listen('MDCTopAppBar:nav', () => {

                    vis.binds.materialdesign.helper.vibrate(data.vibrateTopAppBarOnMobilDevices);

                    if (data.drawerLayout === 'dismissible') {
                        if (drawer.open) {
                            let width = window.getComputedStyle(widget, null).width;
                            let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;

                            if (data.topAppBarLayout !== 'short') {
                                $this.parent().find('.mdc-top-app-bar').css('width', width);
                            } else {
                                if (!vis.editMode) {
                                    $this.parent().find('.mdc-top-app-bar').css('left', '0px');
                                }
                            }
                            $this.parent().find('.drawer-frame-app-content').css('left', '0px');

                            drawer.open = !drawer.open;
                        } else {
                            let width = window.getComputedStyle(widget, null).width;
                            let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;
                            let barWidth = width.replace('px', '') - widthDrawer.replace('px', '');

                            drawer.open = !drawer.open;

                            setTimeout(function () {
                                if (data.topAppBarLayout !== 'short') {
                                    $this.parent().find('.mdc-top-app-bar').css('width', barWidth);
                                } else {
                                    if (!vis.editMode) {
                                        $this.parent().find('.mdc-top-app-bar').css('left', widthDrawer);
                                    }
                                }
                                $this.parent().find('.drawer-frame-app-content').css('left', widthDrawer);
                            }, 250);
                        }
                    } else {
                        drawer.open = !drawer.open;
                    }
                });

                var val = vis.states.attr(data.oid + '.val');

                toggleSubItemByIndex(val);

                navList.selectedIndex = parseInt($this.find(`.mdc-list-item[id="listItem_${val}"]`).eq(0).attr('index'));

                setTopAppBarWithDrawerLayout(val);

                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    toggleSubItemByIndex(newVal);

                    navList.selectedIndex = parseInt($this.find(`.mdc-list-item[id="listItem_${newVal}"]`).eq(0).attr('index'));
                    setTopAppBarWithDrawerLayout(newVal);
                });

                $this.find('.mdc-list-item').click(function () {
                    let selctedIndex = parseInt($(this).eq(0).attr('id').replace('listItem_', ''));

                    let itemIsDisabled = $(this).eq(0).hasClass('mdc-list-item--disabled');

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

                            navList.selectedIndex = parseInt($this.find(`.mdc-list-item[id="listItem_${selctedIndex}"]`).eq(0).attr('index'));
                        } else {
                            // listItem
                            val = vis.states.attr(data.oid + '.val');

                            if (val != selctedIndex) {
                                myMdwHelper.setValue(data.oid, selctedIndex);

                                setTopAppBarWithDrawerLayout(selctedIndex);

                                setTimeout(function () {
                                    window.scrollTo({ top: 0, left: 0, });
                                }, 50);
                            }

                            if (data.drawerLayout === 'modal') {
                                drawer.open = false;
                            }
                        }
                    }
                });


                function setTopAppBarWithDrawerLayout(index) {
                    if (data.showSelectedItemAsTitle) {
                        let selectedName = $this.parent().find(`span[id="listItem_${index}"]`).text();
                        $this.parent().find('.mdc-top-app-bar__title').text(selectedName)
                    }
                }

                function toggleSubItemByIndex(index) {
                    let selectedListItem = $this.find(`.mdc-list-item[id="listItem_${index}"]`);
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
            }
        } catch (ex) {
            console.error(`[TopAppBar - ${data.wid}] handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};