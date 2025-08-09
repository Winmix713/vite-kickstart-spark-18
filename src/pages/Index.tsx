import React from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Zap, 
  Code, 
  Eye, 
  ArrowRight, 
  Layers,
  Sparkles,
  Grid3X3,
  Search,
  Filter
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: "Dinamikus Betöltés",
      description: "Komponensek automatikus felderítése és betöltése runtime-ban"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Élő Előnézet",
      description: "Valós idejű komponens megjelenítés hibakezeléssel"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Intelligens Keresés",
      description: "Gyors keresés név és útvonal alapján"
    },
    {
      icon: <Filter className="w-8 h-8" />,
      title: "Kategória Szűrés",
      description: "Komponensek és widgetek külön kezelése"
    },
    {
      icon: <Grid3X3 className="w-8 h-8" />,
      title: "Rugalmas Nézetek",
      description: "Grid és lista nézet közötti váltás"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Teljesítmény",
      description: "Optimalizált lazy loading és memoization"
    }
  ];

  const stats = [
    { label: "Támogatott Fájltípus", value: "JSX & TSX", color: "bg-blue-500" },
    { label: "Automatikus Felderítés", value: "100%", color: "bg-green-500" },
    { label: "Hibakezelés", value: "Teljes", color: "bg-purple-500" },
    { label: "Reszponzív", value: "Mobile First", color: "bg-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Dinamikus React Komponens Showcase
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Fedezd fel a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                komponenseidet
              </span>
              <br />
              élő előnézetben
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Automatikusan felderíti és megjeleníti az összes React komponensedet 
              és widgetedet egy modern, kereshető és szűrhető felületen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/showcase"
                className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Package className="w-5 h-5 mr-2" />
                Komponensek Böngészése
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <button className="inline-flex items-center px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                <Code className="w-5 h-5 mr-2" />
                Dokumentáció
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                  <div className={`w-3 h-3 ${stat.color} rounded-full mb-3`}></div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Miért válaszd a Component Showcase-t?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern funkciók, amelyek megkönnyítik a komponenseid kezelését és áttekintését
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Hogyan működik?
            </h2>
            <p className="text-xl text-gray-600">
              Egyszerű, automatikus folyamat
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Automatikus Felderítés</h3>
              <p className="text-gray-600">
                A rendszer automatikusan felderíti az összes .jsx és .tsx fájlt a components és widgets mappákban
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Dinamikus Betöltés</h3>
              <p className="text-gray-600">
                Lazy loading segítségével csak akkor tölti be a komponenseket, amikor szükség van rájuk
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Élő Megjelenítés</h3>
              <p className="text-gray-600">
                Minden komponens élő előnézetben jelenik meg hibakezeléssel és responsive design-nal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Kezdj el még ma!
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Tekintsd meg az összes komponensedet egy helyen, modern és intuitív felületen
          </p>
          
          <Link
            to="/showcase"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Package className="w-5 h-5 mr-2" />
            Showcase Megnyitása
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 React Component Showcase. Minden jog fenntartva.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
