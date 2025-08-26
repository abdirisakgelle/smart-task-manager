import React from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

const BasicWidget = () => {
  return (
    <div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center p-4 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23F1F5F9'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Sales
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  $3,500
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 12% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:currency-dollar" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center p-4 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23FEF3C7'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Orders
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  2,300
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 8% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:shopping-bag" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center p-4 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23DBEAFE'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Customers
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  1,200
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 15% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:users" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 mt-5">
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center p-5 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23D1FAE5'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Revenue
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  $45,200
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 20% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:trending-up" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center p-5 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23FEE2E2'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Products
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  850
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 5% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:cube" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center p-5 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23F3E8FF'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Categories
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  120
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 3% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:tag" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 mt-5">
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center px-5 py-8 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23FEF3C7'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Orders
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  2,300
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 8% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:shopping-bag" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center px-5 py-8 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23DBEAFE'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Customers
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  1,200
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 15% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:users" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div
            className="bg-no-repeat bg-cover bg-center px-5 py-8 rounded-lg relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M96 0H4C1.79086 0 0 1.79086 0 4V96C0 98.2091 1.79086 100 4 100H96C98.2091 100 100 98.2091 100 96V4C100 1.79086 98.2091 0 96 0Z' fill='%23D1FAE5'/%3e%3c/svg%3e")`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                  Total Revenue
                </h4>
                <div className="text-slate-900 dark:text-white text-2xl font-medium mt-4">
                  $45,200
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-normal mt-2">
                  ⬆ 20% From last month
                </div>
              </div>
              <div className="h-12 w-12 bg-white/70 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons-outline:trending-up" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BasicWidget;
