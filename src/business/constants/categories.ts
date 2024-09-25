import { Categories } from "@prisma/client";
import {
    categoriesGroupsChildResponse,
    categoriesGroupsResponse,
} from "../lib/validation";

const transactionCategoriesGroups: categoriesGroupsResponse = {
    [Categories.foodAndDrinks]: {
        id: Categories.foodAndDrinks,
        color: "#f44336",
        title: "Food & Drinks",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.shopping]: {
        id: Categories.shopping,
        color: "#4fc3f7",
        title: "Shopping",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.housing]: {
        id: Categories.housing,
        color: "#ffa726",
        title: "Housing",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.transportation]: {
        id: Categories.transportation,
        color: "#78909c",
        title: "Transportation",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.vehicle]: {
        id: Categories.vehicle,
        color: "#aa00ff",
        title: "Vehicle",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.lifeAndEntertainment]: {
        id: Categories.lifeAndEntertainment,
        color: "#64dd17",
        title: "Life & Entertainment",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.communicationPC]: {
        id: Categories.communicationPC,
        color: "#536dfe",
        title: "Communication, PC",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.financialExpenses]: {
        id: Categories.financialExpenses,
        color: "#00bfa5",
        title: "Financial expenses",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.investemnts]: {
        id: Categories.investemnts,
        color: "#ff4081",
        title: "Investments",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.income]: {
        id: Categories.income,
        color: "#fbc02d",
        title: "Income",
        children: [],
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
};

const transactionCategories: categoriesGroupsChildResponse = {
    [Categories.foodAndDrinks]: {
        id: Categories.foodAndDrinks,
        title: "Food & Drinks",
        group: Categories.foodAndDrinks,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346353/FinTrack/categories/scskumcacmmzv676ru9i.svg",
    },
    [Categories.restaurantAndCafe]: {
        id: Categories.restaurantAndCafe,
        title: "Restaurant, cafe",
        group: Categories.foodAndDrinks,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346400/FinTrack/categories/noj1uguff12tfpmuxqvk.svg",
    },
    [Categories.groceries]: {
        id: Categories.groceries,
        title: "Groceries",
        group: Categories.foodAndDrinks,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346418/FinTrack/categories/exsyyb50kivnn8ktu0nu.svg",
    },
    [Categories.fastFoodBar]: {
        id: Categories.fastFoodBar,
        title: "Fast food, bar",
        group: Categories.foodAndDrinks,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346437/FinTrack/categories/nmegpgywymwuhsap67pz.svg",
    },

    [Categories.shopping]: {
        id: Categories.shopping,
        title: "Shopping",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346527/FinTrack/categories/qqpuni6ikrxdg8a26hza.svg",
    },
    [Categories.pharmacy]: {
        id: Categories.pharmacy,
        title: "Pharmacy",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346618/FinTrack/categories/p6o061kl3bwy7dlckipv.svg",
    },
    [Categories.electronicsAccessories]: {
        id: Categories.electronicsAccessories,
        title: "Electronics, accessories",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346637/FinTrack/categories/mdfm6fjrroh0ldnvincl.svg",
    },
    [Categories.freetime]: {
        id: Categories.freetime,
        title: "Free time",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346653/FinTrack/categories/ugdhlk9qjsntanzuu3yl.svg",
    },
    [Categories.giftJoy]: {
        id: Categories.giftJoy,
        title: "Gift, joy",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346668/FinTrack/categories/orph3imscjpush72jnxx.svg",
    },
    [Categories.healthAndBeauty]: {
        id: Categories.healthAndBeauty,
        title: "Health and beauty",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346684/FinTrack/categories/bebraqqwxjmbf2t7nqs8.svg",
    },
    [Categories.homeGarden]: {
        id: Categories.homeGarden,
        title: "Home, garden",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346700/FinTrack/categories/lddcxxdcrlsiqwoenckg.svg",
    },
    [Categories.jewelsAccessories]: {
        id: Categories.jewelsAccessories,
        title: "Jewels, accessories",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346718/FinTrack/categories/ebx9urh0d6ifcawk41gl.svg",
    },
    [Categories.kids]: {
        id: Categories.kids,
        title: "Kids",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346732/FinTrack/categories/nmqaj4c29vgfm7ovqvqp.svg",
    },
    [Categories.petsAnimals]: {
        id: Categories.petsAnimals,
        title: "Pets, animals",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346747/FinTrack/categories/hmewbuzvinrkxvnuuls8.svg",
    },
    [Categories.stationeryTools]: {
        id: Categories.stationeryTools,
        title: "Stationery, tools",
        group: Categories.shopping,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346761/FinTrack/categories/ao2t3jdh0rqytj52wxdh.svg",
    },

    [Categories.housing]: {
        id: Categories.housing,
        title: "Housing",
        group: Categories.housing,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346832/FinTrack/categories/f31bv3cbvlj1yzsdoaou.svg",
    },
    [Categories.energyUtilities]: {
        id: Categories.energyUtilities,
        title: "Energy, utilities",
        group: Categories.housing,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346931/FinTrack/categories/gptvzjmteawkpl94ofvm.svg",
    },
    [Categories.maintenanceRepairs]: {
        id: Categories.maintenanceRepairs,
        title: "Maintenance, repairs",
        group: Categories.housing,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346947/FinTrack/categories/kwducslnoksfyvpsagc4.svg",
    },
    [Categories.mortage]: {
        id: Categories.mortage,
        title: "Mortage",
        group: Categories.housing,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346961/FinTrack/categories/chgbrnmraleddmnmap9f.svg",
    },
    [Categories.propertyInsurance]: {
        id: Categories.propertyInsurance,
        title: "Property insurance",
        group: Categories.housing,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346971/FinTrack/categories/wuhqdt6r6qw8nseq7dff.svg",
    },
    [Categories.rent]: {
        id: Categories.rent,
        title: "Rent",
        group: Categories.housing,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710346984/FinTrack/categories/jb4dlrswggidkd2y1bwv.svg",
    },
    [Categories.services]: {
        id: Categories.services,
        title: "Services",
        group: Categories.housing,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347003/FinTrack/categories/sidpj89zffkfdb1e1jk0.svg",
    },

    [Categories.transportation]: {
        id: Categories.transportation,
        title: "Transportation",
        group: Categories.transportation,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347133/FinTrack/categories/j7gaw7vuj7iixt18yw46.svg",
    },
    [Categories.businessTrips]: {
        id: Categories.businessTrips,
        title: "Bussiness trips",
        group: Categories.transportation,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347149/FinTrack/categories/fz803qxnnfpg1zl0iton.svg",
    },
    [Categories.longDistance]: {
        id: Categories.longDistance,
        title: "Long distance",
        group: Categories.transportation,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347196/FinTrack/categories/dmbwe8vbh355nrera4bm.svg",
    },
    [Categories.publicTransport]: {
        id: Categories.publicTransport,
        title: "Public transport",
        group: Categories.transportation,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347209/FinTrack/categories/dreqsupra4typyvqkc6j.svg",
    },
    [Categories.taxi]: {
        id: Categories.taxi,
        title: "Taxi",
        group: Categories.transportation,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347222/FinTrack/categories/d76uokmqbzlqm5wbmvpa.svg",
    },
    [Categories.delivery]: {
        id: Categories.delivery,
        title: "Delivery",
        group: Categories.transportation,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347413/FinTrack/categories/dntkqqqxkpzddtarhqpw.svg",
    },

    [Categories.vehicle]: {
        id: Categories.vehicle,
        title: "Vehicle",
        group: Categories.vehicle,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347472/FinTrack/categories/vedhxnzehdzzwscd0sdk.svg",
    },
    [Categories.fuel]: {
        id: Categories.fuel,
        title: "Fuel",
        group: Categories.vehicle,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347486/FinTrack/categories/ttlokksaeqj7xbhcbmyj.svg",
    },
    [Categories.leasing]: {
        id: Categories.leasing,
        title: "Leasing",
        group: Categories.vehicle,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347499/FinTrack/categories/evmzxcz9jeuxmtt65zoa.svg",
    },
    [Categories.parking]: {
        id: Categories.parking,
        title: "Parking",
        group: Categories.vehicle,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347548/FinTrack/categories/fxg4xuu8vitdipsqmw98.svg",
    },
    [Categories.rentals]: {
        id: Categories.rentals,
        title: "Rentals",
        group: Categories.vehicle,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347562/FinTrack/categories/oqvosbezsm3zkwqjdejv.svg",
    },
    [Categories.vehicleInsurance]: {
        id: Categories.vehicleInsurance,
        title: "Vehicle insurance",
        group: Categories.vehicle,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347578/FinTrack/categories/l5gdjpa4aoae3vustdrb.svg",
    },
    [Categories.vehicleMaintenance]: {
        id: Categories.vehicleMaintenance,
        title: "Vehicle maintenance",
        group: Categories.vehicle,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347601/FinTrack/categories/glodrhglelt9xxtfe1cg.svg",
    },

    [Categories.lifeAndEntertainment]: {
        id: Categories.lifeAndEntertainment,
        title: "Life & Entertainment",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347726/FinTrack/categories/scuauh4dn7boizm8ncbq.svg",
    },
    [Categories.activeSportFitness]: {
        id: Categories.activeSportFitness,
        title: "Active sport, fitness",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347831/FinTrack/categories/xxpcmqhvp9jq6lvtoulb.svg",
    },
    [Categories.alcoholTobaco]: {
        id: Categories.alcoholTobaco,
        title: "Alcohol, tobacco",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347847/FinTrack/categories/prii3lswvwtaswgf2xot.svg",
    },
    [Categories.booksAudioSubscriptions]: {
        id: Categories.booksAudioSubscriptions,
        title: "Books, audio, subscriptions",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347897/FinTrack/categories/lv2twsrwkkaarja7wlce.svg",
    },
    [Categories.charityGifts]: {
        id: Categories.charityGifts,
        title: "Charity, gifts",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347914/FinTrack/categories/fidqv4azkubf0cuwigb2.svg",
    },
    [Categories.cultureSportEvents]: {
        id: Categories.cultureSportEvents,
        title: "Culture, sport events",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347941/FinTrack/categories/pbniunjae1avd7w82iby.svg",
    },
    [Categories.educationDevelopment]: {
        id: Categories.educationDevelopment,
        title: "Education, development",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347958/FinTrack/categories/evmnhovklpjzyuqb3ui5.svg",
    },
    [Categories.healthCareDoctor]: {
        id: Categories.healthCareDoctor,
        title: "Health care, doctor",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710347982/FinTrack/categories/ubxsnrdwk7o9muizn8mp.svg",
    },
    [Categories.hobbies]: {
        id: Categories.hobbies,
        title: "Hobbies",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348005/FinTrack/categories/keqnq1xtpzmqjvidjdv5.svg",
    },
    [Categories.holidayTripsHotels]: {
        id: Categories.holidayTripsHotels,
        title: "Holiday, trips, hotels",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348027/FinTrack/categories/vxj2n9el0dc1snl6duic.svg",
    },
    [Categories.lifeEvents]: {
        id: Categories.lifeEvents,
        title: "Life events",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348043/FinTrack/categories/itljrcsfuwawheleydit.svg",
    },
    [Categories.wellnessBeauty]: {
        id: Categories.wellnessBeauty,
        title: "Wellness, beauty",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348064/FinTrack/categories/bahmpnu5agdvcwmmime4.svg",
    },
    [Categories.lotteriesGambling]: {
        id: Categories.lotteriesGambling,
        title: "Lotteries, gambling",
        group: Categories.lifeAndEntertainment,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348083/FinTrack/categories/vy3v9diu7uacnepfjerj.svg",
    },

    [Categories.communicationPC]: {
        id: Categories.communicationPC,
        title: "Communication, PC",
        group: Categories.communicationPC,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348155/FinTrack/categories/xo2iet8acywnreaifpuz.svg",
    },
    [Categories.phoneCellPhone]: {
        id: Categories.phoneCellPhone,
        title: "Phone, cell phone",
        group: Categories.communicationPC,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348170/FinTrack/categories/m715mzwht7x2xykurwzr.svg",
    },
    [Categories.softwareAppsGames]: {
        id: Categories.softwareAppsGames,
        title: "Software, apps, games",
        group: Categories.communicationPC,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348198/FinTrack/categories/onobjo8oik9zdupdy1nl.svg",
    },

    [Categories.financialExpenses]: {
        id: Categories.financialExpenses,
        title: "Financial expenses",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348251/FinTrack/categories/ugotdhoxoxy4yzup78pw.svg",
    },
    [Categories.advisory]: {
        id: Categories.advisory,
        title: "Advisory",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348360/FinTrack/categories/h5nmpriza5entdqh6e2y.svg",
    },
    [Categories.chargesFees]: {
        id: Categories.chargesFees,
        title: "Charges, fees",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348385/FinTrack/categories/r8zv24swxrna2givz7dy.svg",
    },
    [Categories.childSupport]: {
        id: Categories.childSupport,
        title: "Child support",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348398/FinTrack/categories/g1tmfft3xzd9ugkq78r6.svg",
    },
    [Categories.fines]: {
        id: Categories.fines,
        title: "Fines",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348414/FinTrack/categories/dt8t10hvgbfsaijvngxf.svg",
    },
    [Categories.insurance]: {
        id: Categories.insurance,
        title: "Insurance",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348430/FinTrack/categories/y7xusucqb4xqcxtj3w16.svg",
    },
    [Categories.loanInteresys]: {
        id: Categories.loanInteresys,
        title: "Loan, interesys",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348450/FinTrack/categories/rbsrc5skqtok4vvf6hen.svg",
    },
    [Categories.taxes]: {
        id: Categories.taxes,
        title: "Taxes",
        group: Categories.financialExpenses,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348470/FinTrack/categories/y5upjpqt1ufsemzk0bxv.svg",
    },

    [Categories.investemnts]: {
        id: Categories.investemnts,
        title: "Investments",
        group: Categories.investemnts,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348548/FinTrack/categories/ubnfumwcm5gamnhjbrnm.svg",
    },
    [Categories.financialInvestments]: {
        id: Categories.financialInvestments,
        title: "Financial Investments",
        group: Categories.investemnts,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348548/FinTrack/categories/ubnfumwcm5gamnhjbrnm.svg",
    },
    [Categories.realty]: {
        id: Categories.realty,
        title: "Realty",
        group: Categories.investemnts,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348595/FinTrack/categories/jtwx0novjbxli8zuhr0g.svg",
    },
    [Categories.savings]: {
        id: Categories.savings,
        title: "Savings",
        group: Categories.investemnts,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348610/FinTrack/categories/wxypccrihju8bex3axva.svg",
    },
    [Categories.vehicleChattels]: {
        id: Categories.vehicleChattels,
        title: "Vehicles, chattels",
        group: Categories.investemnts,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348633/FinTrack/categories/lkeiwry6lx1yria0p1lo.svg",
    },

    [Categories.income]: {
        id: Categories.income,
        title: "Income",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348743/FinTrack/categories/lds0eyk8lyunws2rgou7.svg",
    },
    [Categories.checksCoupons]: {
        id: Categories.checksCoupons,
        title: "Checks, coupons",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348761/FinTrack/categories/kvhuqwrnitlt2p5xwerc.svg",
    },
    [Categories.childSupportIncome]: {
        id: Categories.childSupportIncome,
        title: "Child support income",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348761/FinTrack/categories/kvhuqwrnitlt2p5xwerc.svg",
    },
    [Categories.duesAndGrants]: {
        id: Categories.duesAndGrants,
        title: "Dues & grants",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348781/FinTrack/categories/umlu4xaod5idcjxydyoe.svg",
    },
    [Categories.gifts]: {
        id: Categories.gifts,
        title: "Gifts",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348792/FinTrack/categories/ungon0h21sa3b9awfowj.svg",
    },
    [Categories.interestsDividends]: {
        id: Categories.interestsDividends,
        title: "Interests, dividends",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348803/FinTrack/categories/wbi5jscblefotanmfpw0.svg",
    },
    [Categories.lendingRenting]: {
        id: Categories.lendingRenting,
        title: "Lending, renting",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348816/FinTrack/categories/yuyx22ijf6dwvng3pzb8.svg",
    },
    [Categories.bussiness]: {
        id: Categories.bussiness,
        title: "Bussiness",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348825/FinTrack/categories/t2hazplqev94kl3wdzno.svg",
    },
    [Categories.refunds]: {
        id: Categories.refunds,
        title: "Refunds (tax, purchase)",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348842/FinTrack/categories/nazhz5xwj8bznuyfvqm5.svg",
    },
    [Categories.rentalIncome]: {
        id: Categories.rentalIncome,
        title: "Rental income",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348858/FinTrack/categories/jkckf5t9jf6k7ojhezad.svg",
    },
    [Categories.wageInvoices]: {
        id: Categories.wageInvoices,
        title: "Wage, invoices",
        group: Categories.income,
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348870/FinTrack/categories/n7y91oa2z8ofw07zzpwk.svg",
    },

    [Categories.transfer]: {
        id: Categories.transfer,
        title: "Transfer",
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348902/FinTrack/categories/cc0jdnf14ansu4kfvh5q.svg",
    },

    [Categories.others]: {
        id: Categories.others,
        title: "Others",
        image:
      "https://res.cloudinary.com/dxw96wkau/image/upload/v1710348929/FinTrack/categories/bfobuwuxmpyqzkmy2ru2.svg",
    },
};

export { transactionCategories, transactionCategoriesGroups };
