KEYCLOAK THEME

docker cp ./soul_theme wonderful_noether:/opt/keycloak/themes/
docker restart wonderful_noether

rm -rf /opt/keycloak/themes/soul_theme

themes/
└── soul_theme/
├── login/
│ ├── theme.properties
│ ├── login.ftl
│ └── resources/
│ ├── css/
│ │ └── styles.css
│ └── img/
├── account/
├── admin/
└── email/
