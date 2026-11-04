"""Add the supplied stand bag offline; RMB 550 owner cost, no network writes."""
import argparse
import add_titleist_premium_stand_bag as bag
bag.SKU="GK-BG020"
bag.COST_CNY=550
bag.BACKUP_PREFIX="taylormade-stand-bag-"
bag.NAME="TaylorMade Stand Bag"
bag.DESCRIPTION="TaylorMade-branded stand bag shown in supplied photographs, with carrying straps, storage pockets, stand legs and rain-hood reference views. White, Black/White, Blue/Lime, Grey/Orange and Black/Red colour preferences. Exact model, dimensions, condition, water resistance, included accessories and availability must be confirmed. AI-enhanced supplier-photo references."
bag.SIZES="Stand bag - confirm dimensions"
bag.COLOURS="White, Black/White, Blue/Lime, Grey/Orange, Black/Red"
bag.VIEWS=[f"{colour}-{view}" for colour in ["white","black-white","blue-lime","grey-orange","black-red"] for view in ["stand","hood","upright-angle","upright","rear"]]
bag.VIEWS.insert(10,"black-white-closeup")
bag.IMAGES=[f"/images/products/gk-bg020/taylormade-stand-bag-{v}.webp" for v in bag.VIEWS]
bag.EXTRA_ATTRS=dict(model_label_verified=False,water_resistance_verified=False,image_provenance="AI-enhanced supplied-photo references")
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--apply",action="store_true")
    bag.main(parser.parse_args().apply)
