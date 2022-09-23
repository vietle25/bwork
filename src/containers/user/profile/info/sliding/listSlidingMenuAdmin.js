import ic_info_green from 'images/ic_info_green.png'
import ic_staff_green from 'images/ic_staff_green.png'
import ic_exchange_green from 'images/ic_exchange_green.png'
import ic_key_green from 'images/ic_key_green.png'
import ic_event_green from 'images/ic_event_green.png'
import ic_logout_green from 'images/ic_logout_green.png'
import slidingMenuType from "enum/slidingMenuType";
import { localizes } from "locales/i18n";
import { Colors } from 'values/colors'

export default list = {
    ADMIN: [
        {
            name: 'Thông tin công ty',
            hasChild: true,
            screen: slidingMenuType.COMPANY_DETAIL,
            icon: ic_info_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Danh sách nhân viên',
            hasChild: true,
            screen: slidingMenuType.STAFF_LIST,
            icon: ic_staff_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Danh sách công ty',
            hasChild: true,
            screen: slidingMenuType.COMPANY_LIST,
            icon: ic_exchange_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Nội quy công ty',
            hasChild: true,
            screen: slidingMenuType.WORKING_POLICY,
            icon: ic_event_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: localizes("userProfileView.changePassword"),
            hasChild: true,
            screen: slidingMenuType.CHANGE_PASSWORD,
            icon: ic_key_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: localizes("setting.log_out"),
            hasChild: false,
            screen: null,
            icon: ic_logout_green,
            color: Colors.COLOR_RED
        }
    ],
    ADMIN_COMPANY: [
        {
            name: 'Thông tin công ty',
            hasChild: true,
            screen: slidingMenuType.COMPANY_DETAIL,
            icon: ic_info_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Danh sách nhân viên',
            hasChild: true,
            screen: slidingMenuType.STAFF_LIST,
            icon: ic_staff_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Danh sách chi nhánh',
            hasChild: true,
            screen: slidingMenuType.BRANCH_LIST,
            icon: ic_exchange_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Nội quy công ty',
            hasChild: true,
            screen: slidingMenuType.WORKING_POLICY,
            icon: ic_event_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: localizes("userProfileView.changePassword"),
            hasChild: true,
            screen: slidingMenuType.CHANGE_PASSWORD,
            icon: ic_key_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: localizes("setting.log_out"),
            hasChild: false,
            screen: null,
            icon: ic_logout_green,
            color: Colors.COLOR_RED
        }
    ],
    ADMIN_BRANCH: [
        {
            name: 'Thông tin công ty',
            hasChild: true,
            screen: slidingMenuType.COMPANY_DETAIL,
            icon: ic_info_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Danh sách nhân viên',
            hasChild: true,
            screen: slidingMenuType.STAFF_LIST,
            icon: ic_staff_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: 'Nội quy công ty',
            hasChild: true,
            screen: slidingMenuType.WORKING_POLICY,
            icon: ic_event_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: localizes("userProfileView.changePassword"),
            hasChild: true,
            screen: slidingMenuType.CHANGE_PASSWORD,
            icon: ic_key_green,
            color: Colors.COLOR_TEXT
        },
        {
            name: localizes("setting.log_out"),
            hasChild: false,
            screen: null,
            icon: ic_logout_green,
            color: Colors.COLOR_RED
        }
    ]
}
