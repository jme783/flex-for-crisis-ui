const darkBlue = '#2B364A';
const purple = '#7375A5';
const emerald = '#21A3A3';

export default {
  colorTheme: {
    baseName: "GreyLight",
    light: true,
    colors: {
      baseColor: darkBlue,
      defaultButtonColor: purple,
      tabSelectedColor: emerald,
    },
    overrides: {
      MainHeader: {
        Container: {
          background: darkBlue
        }
      },
      SideNav: {
        Container: {
          background: purple
        },
        Button: {
          background: purple
        }
      }
    }
  }
};
