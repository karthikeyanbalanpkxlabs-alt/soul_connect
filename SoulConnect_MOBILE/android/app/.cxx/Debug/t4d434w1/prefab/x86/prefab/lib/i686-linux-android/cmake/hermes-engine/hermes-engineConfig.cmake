if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/prabakarann/.gradle/caches/9.0.0/transforms/bf9b4d63d88b157fe9a64e8b52a1a13e/transformed/hermes-android-0.14.1-debug/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/prabakarann/.gradle/caches/9.0.0/transforms/bf9b4d63d88b157fe9a64e8b52a1a13e/transformed/hermes-android-0.14.1-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

