const epOptions = {
    dataStore: null,
    defaults: {
        markdown: {
            auto_format_links: true,
            show_gutter: false
        },
        preview: {
            show: true
        },
        drawer: {
            show: true
        },
        numOfApplicants: {
            numOfApplicants: 1
        }
    },
    sections: [
        {
            id: 'numOfApplicants',
            label: '応募者人数',
            icon: 'multiple-11',
            form: {
                groups: [
                    {
                        label: '応募者人数',
                        fields: [
                            {
                                label: '人数',
                                key: 'numOfApplicants',
                                type: 'slider',
                                min: 1,
                                max: 99,
                                help: '※人数変更を反映させるにはアプリの再起動が必要です'
                            },
                        ]
                    }
                ]
            }
        }
    ]
}


const applicantInfoTemplate = {
    id: 'applicantInfo',
    label: '応募者情報',
    icon: 'single-01',
    form: {
        groups: [
            {
                label: '応募者情報',
                fields: [
                    {
                        label: '氏名',
                        key: 'name',
                        type: 'text',
                    },
                    {
                        label: 'フリガナ',
                        key: 'kana',
                        type: 'text',
                    },
                    {
                        label: '年代',
                        key: 'age',
                        type: 'dropdown',
                        options: [
                            {label: '12歳以下', value: '1'},
                            {label: '13〜19歳', value: '2'},
                            {label: '20〜34歳', value: '3'},
                            {label: '35〜49歳', value: '4'},
                            {label: '50〜64歳', value: '5'},
                            {label: '65歳以上', value: '6'},
                        ],
                    },
                    {
                        label: "性別",
                        key: 'gender',
                        type: 'radio',
                        options: [
                            {label: '男性', value: '1'},
                            {label: '女性', value: '2'},
                        ],
                    },
                    {
                        label: '連絡先電話番号',
                        key: 'tel',
                        type: 'text',
                    },
                    {
                        label: '郵便番号',
                        key: 'zip',
                        type: 'text',
                    },
                    {
                        label: '都道府県',
                        key: 'pref',
                        type: 'dropdown',
                        options: [
                            {label: '北海道', value: '北海道'},
                            {label: '青森県', value: '青森県'},
                            {label: '岩手県', value: '岩手県'},
                            {label: '宮城県', value: '宮城県'},
                            {label: '秋田県', value: '秋田県'},
                            {label: '山形県', value: '山形県'},
                            {label: '福島県', value: '福島県'},
                            {label: '茨城県', value: '茨城県'},
                            {label: '栃木県', value: '栃木県'},
                            {label: '群馬県', value: '群馬県'},
                            {label: '埼玉県', value: '埼玉県'},
                            {label: '千葉県', value: '千葉県'},
                            {label: '東京都', value: '東京都'},
                            {label: '神奈川県', value: '神奈川県'},
                            {label: '山梨県', value: '山梨県'},
                            {label: '長野県', value: '長野県'},
                            {label: '新潟県', value: '新潟県'},
                            {label: '富山県', value: '富山県'},
                            {label: '石川県', value: '石川県'},
                            {label: '福井県', value: '福井県'},
                            {label: '岐阜県', value: '岐阜県'},
                            {label: '静岡県', value: '静岡県'},
                            {label: '愛知県', value: '愛知県'},
                            {label: '三重県', value: '三重県'},
                            {label: '滋賀県', value: '滋賀県'},
                            {label: '京都府', value: '京都府'},
                            {label: '大阪府', value: '大阪府'},
                            {label: '兵庫県', value: '兵庫県'},
                            {label: '奈良県', value: '奈良県'},
                            {label: '和歌山県', value: '和歌山県'},
                            {label: '鳥取県', value: '鳥取県'},
                            {label: '島根県', value: '島根県'},
                            {label: '岡山県', value: '岡山県'},
                            {label: '広島県', value: '広島県'},
                            {label: '山口県', value: '山口県'},
                            {label: '徳島県', value: '徳島県'},
                            {label: '香川県', value: '香川県'},
                            {label: '愛媛県', value: '愛媛県'},
                            {label: '高知県', value: '高知県'},
                            {label: '福岡県', value: '福岡県'},
                            {label: '佐賀県', value: '佐賀県'},
                            {label: '長崎県', value: '長崎県'},
                            {label: '熊本県', value: '熊本県'},
                            {label: '大分県', value: '大分県'},
                            {label: '宮崎県', value: '宮崎県'},
                            {label: '鹿児島県', value: '鹿児島県'},
                            {label: '沖縄県', value: '沖縄県'},
                        ],
                    },
                    {
                        label: '住所',
                        key: 'address',
                        type: 'text',
                    },
                ]
            }
        ]
    }
}

exports.epOptions = epOptions;
exports.applicantInfoTemplate = applicantInfoTemplate;
