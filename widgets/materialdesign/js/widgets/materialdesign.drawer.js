/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.79"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.drawer = {
    initializeTopAppBar: function (data) {
        try {
            let headerLayout = '';
            let headerStyle = '';
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

            let topBarZIndex = myMdwHelper.getValueFromData(data.topAppBarZ_index,'', 'z-index: ', ';');
            
            if (vis.editMode) {
                headerStyle = `style="position: absolute;${topBarZIndex}"`;
            } else {
                headerStyle = `style="position: fixed;${topBarZIndex}"`;
            }

            if (data.drawerLayout === 'modal' || data.drawerLayout === 'dismissible') {
                headerButtonShow = `<button 
                                        class="mdc-icon-button material-icons mdc-top-app-bar__navigation-icon mdc-ripple-upgraded--unbounded mdc-ripple-upgraded" 
                                        style="--mdc-ripple-fg-size:28px; --mdc-ripple-fg-scale:1.7142857142857142; --mdc-ripple-left:10px; --mdc-ripple-top:10px;${myMdwHelper.getValueFromData(data.colorTopAppBarTitle, '', 'color: ', ';')}">
                                            menu
                                        </button>`;
            }

            return { headerLayout: headerLayout, headerStyle: headerStyle, contentLayout: contentLayout, headerButtonShow: headerButtonShow }

        } catch (ex) {
            console.error(`initializeTopAppBar [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
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

                let position = '';
                if (data.drawerLayout === 'modal') {
                    drawerLayout = 'mdc-drawer--modal';

                    if (vis.editMode) {
                        position = 'position: absolute;'
                    } else {
                        drawerModalScrim = `<div class="mdc-drawer-scrim" style="${drawerScrimZIndex}"></div>`;
                    }
                } else {
                    // Layout dismissible & permanent
                    if (!vis.editMode) {
                        drawerLayout = 'mdc-drawer--dismissible mdc-drawer--open';
                        position = 'position: fixed;'
                    } else {
                        drawerLayout = 'mdc-drawer--dismissible mdc-drawer--open';
                        position = 'position: absolute;'
                    }
                }

                drawerStyle = `style="${width}${drawerZIndex}${position}"`;
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
                for (var i = 0; i <= data.count; i++) {
                    let itemHeaderText = myMdwHelper.getValueFromData(data.attr('headers' + i), null);
                    let itemLabelText = myMdwHelper.getValueFromData(data.attr('labels' + i), data.attr('contains_view_' + i));  // Fallback is View Name
                    let itemImage = myMdwHelper.getValueFromData(data.attr('iconDrawer' + i), '');

                    let subItemsArray = '';
                    let hasSubItems = false;
                    let subItemsTextJson = '';
                    let subItemsImageJson = '';

                    if (data.attr('contains_view_' + i) && data.attr('contains_view_' + i).includes('|')) {
                        viewsList.push('');

                        subItemsArray = data.attr('contains_view_' + i).split('|');

                        if (subItemsArray.length > 0) {
                            hasSubItems = true;

                            // parse Label Text for SubItems
                            let labelJsonString = myMdwHelper.getValueFromData(data.attr('labels' + i), null);
                            if (labelJsonString === null) {
                                itemLabelText = data.attr('contains_view_' + i);
                            } else {
                                try {
                                    subItemsTextJson = JSON.parse(labelJsonString);
                                    itemLabelText = subItemsTextJson.itemText;
                                } catch (e) {
                                    subItemsTextJson = '';
                                    itemLabelText = 'Error: wrong format!';
                                }
                            }

                            // parse Image for SubItems
                            let imageJsonString = myMdwHelper.getValueFromData(data.attr('iconDrawer' + i), null);
                            if (imageJsonString !== null) {
                                try {
                                    subItemsImageJson = JSON.parse(imageJsonString);
                                    itemImage = subItemsImageJson.itemImage;
                                } catch (e) {
                                    subItemsImageJson = '';
                                }
                            }
                        }
                    } else {
                        viewsList.push(data.attr('contains_view_' + i));
                    }

                    // generate Header
                    let header = myMdwHelper.getListItemHeader(itemHeaderText, headerFontSize);
                    navItemList.push(header);

                    // generate Item -> mdc-list-item
                    let listItem = myMdwHelper.getListItem(data.drawerItemLayout, itemIndex, itemImage, hasSubItems, false, drawerIconHeight);

                    // generate Item Image for Layout Standard
                    let listItemImage = ''
                    if (data.drawerItemLayout === 'standard') {
                        listItemImage = myMdwHelper.getListItemImage(itemImage, drawerIconHeight);
                    }

                    // generate Item Label
                    let listItemLabel = myMdwHelper.getListItemLabel(data.drawerItemLayout, itemIndex, itemLabelText, hasSubItems, dawerLabelFontSize, dawerLabelShow, data.colorSubItemToggleIcon, backdropLabelBackgroundHeight, false, data.listItemAlignment);

                    // generate Item
                    navItemList.push(`${listItem}${listItemImage}${listItemLabel}</div>`);

                    // generate SubItems
                    if (hasSubItems) {
                        navItemList.push(`<nav class="mdc-list mdc-sub-list">`);

                        for (var d = 0; d <= subItemsArray.length - 1; d++) {
                            viewsList.push(subItemsArray[d].trim());

                            itemIndex++;

                            let subItemImage = '';
                            if (subItemsImageJson && subItemsImageJson.subItems && subItemsImageJson.subItems.length > 0) {
                                subItemImage = myMdwHelper.getValueFromData(subItemsImageJson.subItems[d], '');
                            }

                            let subItemText = '';
                            if (subItemsTextJson && subItemsTextJson.subItems && subItemsTextJson.subItems.length > 0) {
                                subItemText = myMdwHelper.getValueFromData(subItemsTextJson.subItems[d], subItemsArray[d]);
                            } else {
                                subItemText = subItemsArray[d];
                            }

                            // generate SubItem -> mdc-list-item
                            let listSubItem = myMdwHelper.getListItem(data.drawerSubItemLayout, itemIndex, subItemImage, false, true, drawerSubItemIconHeight);

                            // generate Item Image for Layout Standard
                            let listSubItemImage = ''
                            if (data.drawerSubItemLayout === 'standard') {
                                listSubItemImage = myMdwHelper.getListItemImage(subItemImage, drawerSubItemIconHeight);
                            }

                            // generate Item Label
                            let listSubItemLabel = myMdwHelper.getListItemLabel(data.drawerSubItemLayout, itemIndex, subItemText, false, dawerSubItemLabelFontSize, dawerSubItemsLabelShow, '', backdropSubLabelBackgroundHeight, true, data.listSubItemAlignment);

                            // generate SubItem
                            navItemList.push(`${listSubItem}${listSubItemImage}${listSubItemLabel}</div>`);
                        }
                        navItemList.push(`</nav>`);
                    }

                    // generate Divider
                    navItemList.push(myMdwHelper.getListItemDivider(data.attr('dividers' + i), data.listItemDividerStyle));

                    itemIndex++;
                }
            }
        } catch (ex) {
            console.error(`initializeDrawer [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handler: function (el, data) {
        try {
            let $this = $(el);

            let widget = $this.parent().parent().get(0);
            let mdcDrawer = $this.context;
            let mdcTopAppBar = $this.parent().find('.mdc-top-app-bar').get(0);
            let mdcList = $this.parent().find('.mdc-list').get(0);

            setTimeout(function () {
                // Bug fix für TopAppBar, da position: fixed sein muss, deshlab zur Laufzeit width anpassen -> wird von widget genommen
                $this.parent().parent().css('left', '0px');
                $this.parent().parent().css('top', '0px');


                if (data.drawerLayout === 'modal') {
                    let width = window.getComputedStyle(widget, null).width;

                    if (data.topAppBarLayout !== 'short') {
                        $this.parent().find('.mdc-top-app-bar').css('width', width);
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
                        }
                    }
                    $this.parent().find('.drawer-frame-app-content').css('left', widthDrawer);
                }

            }, 1);

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

            let colorDrawerbackdropLabelBackground = myMdwHelper.getValueFromData(data.colorDrawerbackdropLabelBackground, '');
            mdcList.style.setProperty("--materialdesign-color-list-item-backdrop", colorDrawerbackdropLabelBackground);
            mdcList.style.setProperty("--materialdesign-color-sub-list-item-backdrop", myMdwHelper.getValueFromData(data.colorDrawerbackdropSubLabelBackground, colorDrawerbackdropLabelBackground));

            let colorDrawerbackdropLabelBackgroundActive = myMdwHelper.getValueFromData(data.colorDrawerbackdropLabelBackgroundActive, '');
            mdcList.style.setProperty("--materialdesign-color-list-item-backdrop-activated", colorDrawerbackdropLabelBackgroundActive);
            mdcList.style.setProperty("--materialdesign-color-sub-list-item-backdrop-activated", myMdwHelper.getValueFromData(data.colorDrawerbackdropSubLabelBackgroundActive, colorDrawerbackdropLabelBackgroundActive));

            mdcTopAppBar.style.setProperty("--mdc-theme-primary", myMdwHelper.getValueFromData(data.colorTopAppBarBackground, ''));

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

            navList.selectedIndex = val;
            setTopAppBarWithDrawerLayout();

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                toggleSubItemByIndex(newVal);

                navList.selectedIndex = newVal;
                setTopAppBarWithDrawerLayout();
            });

            $this.find('.mdc-list-item').click(function () {
                let selctedIndex = parseInt($(this).eq(0).attr('id').replace('listItem_', ''));

                vis.binds.materialdesign.helper.vibrate(data.vibrateDrawerOnMobilDevices);

                if ($(this).hasClass('hasSubItems')) {
                    // listItem has subItems ->Toggle SubItems
                    if ($(this).hasClass('toggled')) {
                        $(this).removeClass("toggled");
                        $(this).find(".toggleIcon").html("keyboard_arrow_down");
                    } else {
                        $(this).addClass("toggled");
                        $(this).find(".toggleIcon").html("keyboard_arrow_up");
                    }

                    $(this).next("nav.mdc-sub-list").toggle();

                    navList.selectedIndex = selctedIndex;
                } else {
                    // listItem
                    val = vis.states.attr(data.oid + '.val');

                    if (val != selctedIndex) {
                        vis.setValue(data.oid, selctedIndex);

                        setTopAppBarWithDrawerLayout();

                        setTimeout(function () {
                            window.scrollTo({ top: 0, left: 0, });
                        }, 50);
                    }

                    if (data.drawerLayout === 'modal') {
                        drawer.open = false;
                    }
                }
            });

            function setTopAppBarWithDrawerLayout() {
                if (data.showSelectedItemAsTitle) {
                    let selectedName = $this.parent().find(`span[id="listItem_${navList.selectedIndex}"]`).text();
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
                        parentListItem.find(".toggleIcon").html("keyboard_arrow_up");
                        parentListItem.next("nav.mdc-sub-list").toggle();
                    }
                }
            }

        } catch (ex) {
            console.error(`mdcTopAppBarWithDrawer [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};